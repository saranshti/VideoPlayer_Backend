import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(null, "./public/image");
    } else if (file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      cb(null, "./public/video");
    } else {
      cb(new Error("Please upload an Image or Video"));
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

export const upload = multer({
  storage: storage,
  limits: (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return { fileSize: 5 * 1024 * 1024 };
    } else if (file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return { fileSize: 100 * 1024 * 1024 };
    }
  },
  fileFilter: (req, file, cb) => {
    if (
      !file.originalname.match(/\.(jpg|jpeg|png)$/) &&
      !file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)
    ) {
      return cb(new Error("Please upload an image or Video"));
    }
    cb(null, true);
  },
});
