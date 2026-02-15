import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js"
const router = Router();


router.get("/me", requireAuth, userController.getMe)
router.get("/my_posts", requireAuth, userController.getMyPosts)
router.get("/my_posts/:id", requireAuth, userController.getMyPostsById)
router.get("/stats", requireAuth, userController.getUserStats);



export default router;