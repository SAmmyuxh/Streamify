import e, { Router } from "express";
import { logincontroller, logoutcontroller, onboard, signupcontroller, updateProfile } from "../controllers/auth.controller.js";
import { protectroute } from "../middleware/auth.middleware.js";

const router = e.Router()

router.post('/signup',signupcontroller)
router.post('/login',logincontroller)
router.post('/logout',logoutcontroller)

router.post('/onboard',protectroute,onboard)
router.put('/update-profile', protectroute, updateProfile);
router.get('/me',protectroute,(req,res)=>{
    res.status(200).json({success:true,user:req.user})
})
export default  router