import { Request } from "express";
import multer from "multer";
import path from "path";
import { v4 } from "uuid";

export const UPLOADS_FOLDER = path.resolve(__dirname, '..', '..', '..', 'uploads');

export const uploadConfig = {
    directory: UPLOADS_FOLDER,
    storage: multer.diskStorage({
        destination: UPLOADS_FOLDER,
        filename: (req, file, callback) => {
            const fileExtension = path.extname(file.originalname);
            const fileHash = v4();
            const filename = `${fileHash}${fileExtension}`;
            return callback(null, filename);
        },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Tipo de arquivo inválido'));
        }
    }
};