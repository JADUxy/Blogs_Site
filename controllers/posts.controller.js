import * as postService from "../services/post.services.js";

export async function createPost(req, res) {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const userId = req.user.id; // from auth middleware

    postService.createPost(title, content, userId);

    res.json({ message: "Post created" });
}

export function listPosts(req, res) {
    try {
        let posts;

        if (req.user) {
            // Logged-in user → show reaction state
            posts = postService.getAllPosts(req.user.id);
        } else {
            // Guest user → no reaction state
            posts = postService.getAllPosts(null);
        }

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
}



export function getPostForLoggedUser(req, res) {
    const post = postService.getPostById(req.params.id,req.user.id);
    console.log(req.query.id);

    if (!post) return res.status(404).json({ error: "Not found" });

    res.json(post);
}
export function getPostForAnonymous(req, res) {
    console.log("get post for anonymous")
    const post = postService.getPostByIdPublic(req.params.id);
    console.log(req.query.id);

    if (!post) return res.status(404).json({ error: "Not found" });

    res.json(post);
}

export function deletePost(req, res) {
    postService.deletePost(req.params.id);
    res.json({ message: "Deleted" });
}


export function reactToPost(req, res) {
    const postId = req.params.id;
    const userId = req.user.id;
    const { type } = req.body;

    if (!["like", "dislike"].includes(type)) {
        return res.status(400).json({ error: "Invalid reaction type" });
    }

    const result = postService.toggleReaction(postId, userId, type);

    res.json(result);
}

export function keywordSearch(req,res){
    const keyword = req.params.keyword;

    if(!keyword){
        return res.json({
            status: false,
            message: "no keyword found"
        })
    }

    const result = postService.searchPosts(keyword);
    return res.json(
        {
            status: true,
            posts: result
        }
    )

}

function buildCommentTree(comments) {

    const map = {};
    const roots = [];

    comments.forEach(c => {
        map[c.id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
        if (c.parent_id) {
            map[c.parent_id].replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });
    return roots;
}
export function getComments(req,res){
    const postId = req.params.post_id;
    const comments = postService.getComments(postId);
    console.log("comments are")
    console.log(comments)
    res.json({
        status: true,
        comments: buildCommentTree(comments)
    })
}

export function createComment(req,res){
    const {content, postId, parentId} = req.body;
    const userId = req.user.id;
    if(!content || !userId || !postId){
        return res.status(400).json({
            status: false,
            message: "Missing Field"
        })
    }

    try {
        const result = postService.createComment(content,userId,postId,parentId);
        res.json({
            status: true,
            message: result
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "cant create the comment"
        })
    }


}