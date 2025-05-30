import express from'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { validateCoupon ,getCoupon} from '../controllers/coupon.controller.js';
//const router=express.Router();
const router=express.Router();
router.get("/",protectRoute,getCoupon);
router.get("/validate",protectRoute,validateCoupon);

export default router;
