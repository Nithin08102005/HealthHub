import { sql } from "../config/db.js";
import validator from "validator";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";
import fs from "fs";
async function userRegister(req, res) {
  try {
    const { name, email, password, role, gender, phone } = req.body;

    if (!name || !email || !password || !role || !gender || !phone) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      return res.json({
        success: false,
        message: "User already exists with the provided email ",
      });
    }

    if (role === "patient") {
      const { date_of_birth, address } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result =
        await sql`INSERT INTO users (name, email, password,role,phone,gender) VALUES (${name}, ${email}, ${hashedPassword},${role},${phone},${gender}) RETURNING *`;
      const token = jwt.sign(
        { id: result[0].id, role: result[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      await sql`INSERT INTO patients (user_id,email,name,phone,gender,date_of_birth,address) VALUES (${result[0].id},${email},${name},${phone},${gender},${date_of_birth},${address})`;

      res.json({ success: true, data: result[0], token });
    } else if (role === "doctor") {
      const file = req.file;
      let newFileId = null;
      let imageUrl = null;
      if (file) {
        try {
          const filePath = file.path;
          const fileBuffer = fs.readFileSync(filePath);

          const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: file.originalname,
            folder: "/uploads",
            tags: ["user-upload"],
            useUniqueFileName: true,
            transformation: { pre: "q-80,f-auto" },
          });

          // Clean up temporary file

          imageUrl = uploadResponse.url;
          newFileId = uploadResponse.fileId;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res.json({
            success: false,
            message: "Failed to upload image: " + uploadError.message +" Please upload another image",
          });
        } finally {
          if (file && file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
          }
        }
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
         const result =
        await sql`INSERT INTO users (name, email, password,role,phone,gender) VALUES (${name}, ${email}, ${hashedPassword},${role},${phone},${gender}) RETURNING *`;
      const {
        specialization,
        qualification,
        address,
        about,
        experience_years,
        consultation_fee,
        is_available,
      } = req.body;
      if (newFileId) {
        await sql`INSERT INTO doctors (user_id,email,name,phone,gender,specialization,qualification,address,about,experience_years,consultation_fee,is_available,image,file_id) VALUES (${result[0].id},${email},${name},${phone},${gender},${specialization},${qualification},${address},${about},${experience_years},${consultation_fee},${is_available},${imageUrl},${newFileId})`;
      } else {
        await sql`INSERT INTO doctors (user_id,email,name,phone,gender,specialization,qualification,address,about,experience_years,consultation_fee,is_available) VALUES (${result[0].id},${email},${name},${phone},${gender},${specialization},${qualification},${address},${about},${experience_years},${consultation_fee},${is_available})`;
      }
      res.json({success:true});
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}
async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const user = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (user.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user[0].id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expiry (7 days)
    );

    res.json({ success: true, role: user[0].role, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

async function getUserDetails(req, res) {
  try {
    const { userId } = req.user;

    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const role = user[0].role;
    let userData;
    if (role === "patient") {
      userData = await sql`SELECT * FROM patients WHERE user_id = ${userId}`;
    } else if (role === "doctor") {
      userData = await sql`SELECT * FROM doctors WHERE user_id = ${userId}`;
    } else if (role === "admin") {
      userData = await sql`SELECT * FROM users WHERE id = ${userId}`;
    } else {
      return res.json({ success: false, message: "Invalid role" });
    }
    res.json({ success: true, data: userData[0], role: role });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

var imagekit = new ImageKit({
  publicKey: process.env.PUBLICKEY,
  privateKey: process.env.PRIVATEKEY,
  urlEndpoint: process.env.URLENDPOINT,
});

async function userUpdate(req, res) {
  try {
    const {
      name,
      gender,
      phone,
      date_of_birth,
      address,
      specialization,
      qualification,
      about,
      experience_years,
      consultation_fee,
      is_available,
    } = req.body;

    const { userId, role } = req.user;
    const file = req.file; // This will be available if a file was uploaded
    // Check if the user exists
    const existingUser = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (existingUser.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    let imageUrl = null;
    let newFileId = null;
    let oldFileId = null;

    // Get existing file ID to delete old image if new one is uploaded
    if (file) {
      if (role === "patient") {
        const patientData =
          await sql`SELECT file_id FROM patients WHERE user_id = ${userId}`;
        oldFileId = patientData.length > 0 ? patientData[0].file_id : null;
      } else if (role === "doctor") {
        const doctorData =
          await sql`SELECT file_id FROM doctors WHERE user_id = ${userId}`;
        oldFileId = doctorData.length > 0 ? doctorData[0].file_id : null;
      }

      // Upload new image
      try {
        const filePath = file.path;
        const fileBuffer = fs.readFileSync(filePath);

        const uploadResponse = await imagekit.upload({
          file: fileBuffer,
          fileName: file.originalname,
          folder: "/uploads",
          tags: ["user-upload"],
          useUniqueFileName: true,
          transformation: { pre: "q-80,f-auto" },
        });

        // Clean up temporary file

        imageUrl = uploadResponse.url;
        newFileId = uploadResponse.fileId;

        // Delete old image if it exists and is not null (not default image)
        if (oldFileId) {
          try {
            await imagekit.deleteFile(oldFileId);
            // console.log("Old image deleted successfully");
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
            // Don't fail the entire operation if old image deletion fails
          }
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image: " + uploadError.message,
        });
      } finally {
        if (file && file.path) {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        }
      }
    }

    // Update user basic details
    const updatedUser = await sql`
      UPDATE users 
      SET name = ${name}, role = ${role}, gender = ${gender}, phone = ${phone}
      WHERE id = ${userId}
      RETURNING *`;

    // Handle role-specific updates
    if (role === "patient") {
      const updateData = {
        date_of_birth,
        address,
      };

      // Add image data if new image was uploaded
      if (newFileId) {
        await sql`
          UPDATE patients 
          SET date_of_birth = ${date_of_birth}, 
              address = ${address},
              file_id = ${newFileId},
              name= ${name},
              phone = ${phone}, 
              gender=${gender},
              image = ${imageUrl}
          WHERE user_id = ${userId}`;
      } else {
        await sql`
          UPDATE patients 
          SET date_of_birth = ${date_of_birth}, 
              address = ${address},
               name= ${name},
              phone = ${phone}, 
              gender=${gender}
          WHERE user_id = ${userId}`;
      }
    } else if (role === "doctor") {
      // Add image data if new image was uploaded
      if (newFileId) {
        await sql`
          UPDATE doctors 
          SET specialization = ${specialization}, 
              qualification = ${qualification},
              address = ${address}, 
              about = ${about}, 
              experience_years = ${experience_years},
              consultation_fee = ${consultation_fee}, 
              is_available = ${is_available},
              file_id = ${newFileId},
               name= ${name},
              phone = ${phone}, 
              gender=${gender},
              image= ${imageUrl}
          WHERE user_id = ${userId}`;
      } else {
        await sql`
          UPDATE doctors 
          SET specialization = ${specialization}, 
              qualification = ${qualification},
              address = ${address}, 
              about = ${about}, 
              experience_years = ${experience_years},
              consultation_fee = ${consultation_fee}, 
              is_available = ${is_available},
               name= ${name},
              phone = ${phone}, 
              gender=${gender}
          WHERE user_id = ${userId}`;
      }
    }

    const responseData = {
      ...updatedUser[0],
      ...(imageUrl && { imageUrl, fileId: newFileId }),
    };

    res.json({
      success: true,
      message: "User details updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export { userRegister, userLogin, getUserDetails, userUpdate };
