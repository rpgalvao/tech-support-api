import { Router } from "express";

const route = Router();

// Health check route
route.get('/ping', (req, res) => {
    res.json({ pong: true });
});

export default route;