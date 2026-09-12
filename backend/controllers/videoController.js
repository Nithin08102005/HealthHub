import pkg from "agora-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import "dotenv/config";

export async function generateAgoraToken(req, res) {
  try {
    const { channelName } = req.body;

    if (!channelName) {
      return res.json({ success: false, message: "Channel name is required" });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.json({
        success: false,
        message: "Agora credentials are not configured in the server environment (.env)",
      });
    }

    // Role is publisher for both patients and doctors
    const role = RtcRole.PUBLISHER;
    
    // UID = 0 allows Agora to assign a dynamic numerical UID to the user
    const uid = 0; 
    
    // Token validity (1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    res.json({
      success: true,
      token,
      appId,
    });
  } catch (error) {
    console.error("Agora Token Generation Error:", error);
    res.json({ success: false, message: "Failed to generate token: " + error.message });
  }
}
