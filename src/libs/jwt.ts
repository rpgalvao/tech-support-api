import JWT from 'jsonwebtoken';

type TokenPayload = {
    id: string,
    name: string,
    role: string;
};
const SECRET = process.env.JWT_SECRET_KEY as string;

export const generateToken = (payload: any) => {
    return JWT.sign(payload, SECRET);
};

export const decodeToken = (token: string): TokenPayload | undefined => {
    try {
        const user = JWT.verify(token, SECRET);
        return user as TokenPayload;
    } catch (error) {
        console.log('Falha JWT: ', error);
    }
};