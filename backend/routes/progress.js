import express from "express"; 

const router = express.Router();
import { protect } from "../middlewares/authMiddleware.js"; 
import { logEvent, getAnalytics } from "../controllers/progressController.js"; 


router.use(protect);

router.post("/event", logEvent);
router.get("/analytics", getAnalytics);

export default router;