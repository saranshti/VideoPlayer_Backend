import multer from "multer";
import fs from "fs-extra";
import path from "path";

const uploadPath = path.join(process.cwd(), "public/video");
const uploadPathChunks = path.join(process.cwd(), "public/chunks");

// Ensure the upload directories exist
await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(uploadPathChunks, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    const baseFileName = file.originalname.replace(/\s+/g, "");

    fs.readdir(uploadPathChunks, (err, files) => {
      if (err) {
        return cb(err);
      }

      // Filter files that match the base filename
      const matchingFiles = files.filter((f) => f.startsWith(baseFileName));

      let chunkNumber = 0;
      if (matchingFiles.length > 0) {
        // Extract the highest chunk number
        const highestChunk = Math.max(
          ...matchingFiles.map((f) => {
            //use spread operator because the Math.max does not accept the array
            const match = f.match(/\.part_(\d+)$/);
            return match ? parseInt(match[1], 10) : -1; //this parseint convert number in to base 10
          })
        );
        chunkNumber = highestChunk + 1;
      }

      const fileName = `${baseFileName}.part_${chunkNumber}`;
      cb(null, fileName);
    });
  },
});

export const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/octet-stream" ||
      file.mimetype === "image/jpeg"
      // file.originalname.match(/\.(jpg|jpeg|png)$/)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Not a video file. Please upload only videos."));
    }
  },
});
