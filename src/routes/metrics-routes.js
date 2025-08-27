import express from 'express';
import { sendMetrics } from '../controllers/metrics-controller.js';

const router = express.Router();
router.get('/metrics', sendMetrics);
export default router;

