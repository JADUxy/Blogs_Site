import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listPosts, createPost, deletePost, getPostForAnonymous, getPostForLoggedUser, reactToPost, keywordSearch, getComments } from "../controllers/posts.controller.js";
const router = express.Router();


router.get("/comments/:post_id", getComments)

router.get("/", listPosts);
router.get("/logged", requireAuth, listPosts);
// router.get("/:id", getPostForAnonymous);
router.get("/logged/:id", requireAuth, getPostForLoggedUser);

router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

router.post("/:id/react", requireAuth, reactToPost);

router.get("/search/:keyword", keywordSearch)




export default router;