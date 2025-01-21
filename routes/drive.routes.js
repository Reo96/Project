import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import middleware from '../middlewares/auth.js' 
import User from '../models/user.model.js'
const router = express.Router();

// Load the service account key file
const serviceAccountKey = "new-proj-a03e2-3fe47b280ab2.json"; // Replace with the path to your key file
const auth = new google.auth.GoogleAuth({
  keyFile: serviceAccountKey,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Multer setup
const upload = multer({ dest: "uploads/" }); // Temporary folder for uploaded files

router.get("/upload", middleware ,(req,res)=>{
  const message = req.query.message || '';
  res.render('upload', { message });
})
// File upload route
router.post("/upload",middleware , upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const userId = req.session.user._id;
    // Upload the file to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: req.file.originalname, // Use the original file name
        parents: ["1wBWpIAp8ayBiFrYCbgexgG2y83n-sqks"],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath), // Stream file to Drive
      },
    });
    // Delete the temporary file from the server
    fs.unlinkSync(filePath);
    const uploadedFile = driveResponse.data;

    // Update the user's uploads array
    await User.findByIdAndUpdate(userId, { $push: { uploads: uploadedFile.id } });
    const message = `File uploaded successfully`;
    res.render('upload', { message });
  } catch (error) {
    res.status(500).send("Error uploading file: " + error.message);
  }
});

router.get("/files",middleware, async (req, res) => {
  console.log(req.session.user);

  const folderId = "1wBWpIAp8ayBiFrYCbgexgG2y83n-sqks";
  const message = req.query.message || null; // Retrieve the message query parameter if it exists

  try {
    // console.log(req.session.user._id);
    const user = await User.findById(req.session.user._id);
    if(!user) return res.redirect('/user/login');

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType)",
    });

    const allfiles = response.data.files;
    const files = allfiles.filter(file => user.uploads.includes(file.id));
    if (files.length === 0) {
      return res.render("files", { files: [], message: message || "You have not uploaded any files yet" });
    }

    res.render("files", { files, message });
  } catch (err) {
    console.log(err)
    res.redirect(`/drive/files?error=${encodeURIComponent(err.message)}`);
  }
});


router.get("/download/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Disposition", `attachment; filename="downloaded-file"`);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post("/delete/:id", async (req, res) => {
  const fileId = req.params.id;
  const userId = req.session.user._id;
  if(!fileId){
    return res.status(400).send({ error: 'No file specified to delete' });
  }
  try {
    await User.findByIdAndUpdate(userId, { $pull: { uploads: fileId } });
    await drive.files.delete({ fileId });
    res.redirect("/drive/files");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      alert('error logging out');
      return res.redirect('/files');
    }
    res.clearCookie('connect.sid');
    res.redirect('/user/login');
  });
});


export default router;
