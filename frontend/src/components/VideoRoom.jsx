import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, User, MessageSquare } from "lucide-react";
import axios from "axios";
import ChatDrawer from "./ChatDrawer.jsx";

const VideoRoom = ({ channelName, onLeave, appointmentId, senderId, receiverId, receiverName }) => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const [showChat, setShowChat] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);

  // Fallback testing App ID
  const APP_ID = import.meta.env.VITE_AGORA_APP_ID || "d0ccb1897d264267ab67f81b16c87342";

  useEffect(() => {
    let isMounted = true;
    let audioTrack = null;
    let videoTrack = null;

    const initAgora = async () => {
      try {
        if (client.connectionState !== "DISCONNECTED") {
          console.warn("Agora client is not disconnected. Skipping init.");
          return;
        }

        const tokenVal = localStorage.getItem("token");
        const tokenResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/user/agora-token`,
          { channelName },
          { headers: { token: tokenVal } }
        );

        if (!isMounted) return;

        if (!tokenResponse.data.success) {
          throw new Error(tokenResponse.data.message || "Failed to generate Agora token");
        }

        const { token, appId } = tokenResponse.data;

        console.log(`[Agora SDK] Joining Channel: "${channelName}" with App ID: "${appId}"`);

        // Event handlers for remote users (registered BEFORE joining to avoid missing pre-existing streams)
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (!isMounted) return;

          // Add/update user in remote users state to trigger a React re-render
          setRemoteUsers((prev) => {
            const clean = prev.filter((u) => u.uid !== user.uid);
            return [...clean, user];
          });

          if (mediaType === "video" && user.videoTrack) {
            // Wait briefly for the DOM element to render before playing
            setTimeout(() => {
              const container = document.getElementById(`remote-player-${user.uid}`);
              if (container) {
                user.videoTrack.play(container);
              }
            }, 150);
          }
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (!isMounted) return;
          console.log(`[Agora SDK] Remote user ${user.uid} unpublished: ${mediaType}`);
          // Do NOT remove the user from the channel. Just update state to trigger re-render
          setRemoteUsers((prev) => {
            const clean = prev.filter((u) => u.uid !== user.uid);
            return [...clean, user];
          });
        });

        client.on("user-left", (user) => {
          if (!isMounted) return;
          console.log(`[Agora SDK] Remote user ${user.uid} left the channel`);
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        // Join channel
        await client.join(appId, channelName, token, null);

        if (!isMounted) {
          client.leave();
          return;
        }

        // Create local tracks with fallbacks for permissions/locking
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          setLocalAudioTrack(audioTrack);
        } catch (e) {
          console.warn("Microphone access failed, proceeding without audio:", e);
        }

        try {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
          setLocalVideoTrack(videoTrack);
        } catch (e) {
          console.warn("Camera access failed, proceeding in Audio-Only mode:", e);
          setVideoOn(false);
        }

        if (!isMounted) {
          if (audioTrack) {
            audioTrack.stop();
            audioTrack.close();
          }
          if (videoTrack) {
            videoTrack.stop();
            videoTrack.close();
          }
          client.leave();
          return;
        }

        // Publish available local tracks
        const tracksToPublish = [];
        if (audioTrack) tracksToPublish.push(audioTrack);
        if (videoTrack) tracksToPublish.push(videoTrack);

        if (tracksToPublish.length > 0) {
          await client.publish(tracksToPublish);
        }

        setJoined(true);
      } catch (err) {
        console.error("Agora Init Error:", err);
        if (isMounted) {
          setError(err.message || String(err));
        }
      }
    };

    initAgora();

    return () => {
      isMounted = false;
      // Clean up Agora client and tracks
      if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
      }
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }
      if (client.connectionState !== "DISCONNECTED") {
        client.leave();
      }
    };
  }, [channelName]);



  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!videoOn);
      setVideoOn(!videoOn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-6 py-4 rounded-2xl max-w-lg text-center mb-6 text-xs leading-relaxed">
          <p className="font-bold mb-1 text-sm">⚠️ WebRTC Stream Error:</p>
          <p>{error}</p>
          <p className="mt-2 text-slate-400">Please verify your camera/mic are plugged in, not currently in use by another app, and that you granted browser permissions.</p>
        </div>
      )}
      {/* Video Screens Grid */}
      <div className="relative w-full max-w-5xl h-[75vh] grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-4">
        
        {/* Local Stream (Patient/Doctor themselves) */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
          <div 
            ref={(el) => {
              if (el && localVideoTrack) {
                localVideoTrack.play(el);
              }
            }} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {!videoOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 z-10">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-2">
                <User className="w-10 h-10" />
              </div>
              <span className="text-sm font-semibold">Your Video is Off</span>
            </div>
          )}
          <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10 z-20">
            You {(!micOn) && " (Muted)"}
          </span>
        </div>

        {/* Remote Stream (Partner) */}
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <div key={`${user.uid}_${user.videoTrack ? "video" : "novideo"}`} className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <div 
                ref={(el) => {
                  if (el && user.videoTrack) {
                    user.videoTrack.play(el);
                  }
                }} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              {!user.videoTrack && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 z-10">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-2">
                    <User className="w-10 h-10" />
                  </div>
                  <span className="text-xs font-semibold">Camera Off / Audio Only</span>
                </div>
              )}
              <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10 z-20">
                Consultant
              </span>
            </div>
          ))
        ) : (
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
            <h4 className="text-white font-bold text-base mb-1">Waiting for partner...</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Please stay in the room. The other party will appear as soon as they join.
            </p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="mt-6 flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
            micOn 
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" 
              : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
            videoOn 
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" 
              : "bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30"
          }`}
        >
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={onLeave}
          className="w-12 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        {appointmentId && (
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              showChat 
                ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500" 
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>

      {appointmentId && (
        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          appointmentId={appointmentId}
          senderId={senderId}
          receiverId={receiverId}
          receiverName={receiverName}
        />
      )}
    </div>
  );
};

export default VideoRoom;
