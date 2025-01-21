import path from "path";
import fs from "fs-extra";

const uploadPath = path.join(process.cwd(), "public/video");
const uploadPathChunks = path.join(process.cwd(), "public/chunks");

export const mergeChunks = async (fileName, totalChunks) => {
  const writeStream = fs.createWriteStream(path.join(uploadPath, fileName));

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);

    // Ensure the chunk exists
    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Chunk ${i} not found.`);
    }

    const chunkStream = fs.createReadStream(chunkPath);
    await new Promise((resolve, reject) => {
      chunkStream.pipe(writeStream, { end: false });
      chunkStream.on("end", resolve);
      chunkStream.on("error", reject);
    });

    // After merging the chunk, delete the chunk file
    await fs.promises.unlink(chunkPath);
  }

  writeStream.end();
};
