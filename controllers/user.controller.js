import * as userServices from "../services/user.services.js"


export function getMe(req, res) {
    return res.json({
        status: true,
        user: {
            id: req.user.id,
            username: req.user.username,
        }
    })
}
export function getMyPosts(req, res) {
    const posts = userServices.getMyPosts(req.user.id);
    return res.json({
        status: true,
        posts: posts
    })
}
export function getMyPostsById(req, res) {
    const id = req.param.id;
    if(req.user.id!=id){
        return res.json({
            status: false,
            message: "not your post"
        })
    }
    const posts = userServices.getMyPostById(id);
    return res.json({
        status: true,
        posts: posts
    })
}
export function getUserStats(req, res) {
    const userId = req.user.id;

    const stats = userServices.getUserStats(userId);

    res.json(stats);
}
