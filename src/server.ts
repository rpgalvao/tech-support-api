import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import route from './routes/index.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const server = express();
const port = process.env.PORT || 3000;

server.use(cors());
server.use(helmet());
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use('/api', route);

server.use(errorHandler);
server.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
    console.log(process.env.NODE_ENVIRONMENT);
});