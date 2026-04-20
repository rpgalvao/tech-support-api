import { RequestHandler } from "express";
import * as DashboardService from "../services/dashboard.service";

export const getMetrics: RequestHandler = async (req, res) => {
    const metrics = DashboardService.getDashboardMetrics();
    res.json({ success: true, data: metrics });
};