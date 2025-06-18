import express from "express";
import { recommendCompetitions } from "../controllers/recommendationControllers.js";

const router = express.Router();

// GET route to fetch recommendations by user ID
router.get("/recommend/:id", recommendCompetitions);

export default router;