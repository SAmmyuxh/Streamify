import e, { Router } from "express";
import { logincontroller, logoutcontroller, onboard, signupcontroller, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = e.Router()

router.post('/signup',signupcontroller)
router.post('/login',logincontroller)
router.post('/logout',logoutcontroller)

router.post('/onboard',protectRoute,onboard)
router.put('/update-profile', protectRoute, updateProfile);
router.get('/me',protectRoute,(req,res)=>{
    res.status(200).json({success:true,user:req.user})
})
export default  router