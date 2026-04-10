import JWT from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET_KEY as string;

export const generateToken = async (payload: any) => {
    return await JWT.sign(payload, SECRET);
};