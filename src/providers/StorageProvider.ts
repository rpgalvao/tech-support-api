import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { uploadConfig } from "../libs/multer";

export class StorageProvider {
    public async saveFile(file: string, folder: string, size = 1024): Promise<void> {
        const originalPath = path.resolve(uploadConfig.directory, file);
        const finalPath = path.resolve(uploadConfig.directory, folder, file);
        try {
            await sharp(originalPath)
                .resize(size)
                .toFormat('jpg')
                .jpeg({ quality: 70 })
                .toFile(finalPath);

            await fs.unlink(originalPath);
        } catch (error) {
            console.error(`Erro ao processar a imagem com Sharp: ${error}`);
        }
    }

    public async deleteFile(file: string, folder: string): Promise<void> {
        const filePath = path.resolve(uploadConfig.directory, folder, file);
        try {
            await fs.stat(filePath);
            await fs.unlink(filePath);
        } catch {
            return;
        }
    }
}