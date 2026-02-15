import db from "../db.js";


export function getMyPosts(user_id, currentUserId) {
    return db.prepare(`
        SELECT 
            posts.*,
            users.username,

            COUNT(CASE WHEN post_reactions.type = 'like' THEN 1 END) 
                AS likes_count,

            COUNT(CASE WHEN post_reactions.type = 'dislike' THEN 1 END) 
                AS dislikes_count,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'like'
                THEN 1 ELSE 0 
            END) AS user_liked,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'dislike'
                THEN 1 ELSE 0 
            END) AS user_disliked

        FROM posts

        JOIN users 
            ON posts.user_id = users.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        WHERE posts.user_id = ?

        GROUP BY posts.id

        ORDER BY posts.created_at DESC
    `).all(currentUserId, currentUserId, user_id);
}

export function getMyPostById(postId, currentUserId) {
    return db.prepare(`
        SELECT 
            posts.*,
            users.username,

            COUNT(CASE WHEN post_reactions.type = 'like' THEN 1 END) 
                AS likes_count,

            COUNT(CASE WHEN post_reactions.type = 'dislike' THEN 1 END) 
                AS dislikes_count,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'like'
                THEN 1 ELSE 0 
            END) AS user_liked,

            MAX(CASE 
                WHEN post_reactions.user_id = ? 
                     AND post_reactions.type = 'dislike'
                THEN 1 ELSE 0 
            END) AS user_disliked

        FROM posts

        JOIN users 
            ON posts.user_id = users.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        WHERE posts.id = ?

        GROUP BY posts.id
    `).get(currentUserId, currentUserId, postId);
}

export function getUserStats(userId) {

    const postCount = db.prepare(`
        SELECT COUNT(*) as totalPosts
        FROM posts
        WHERE user_id = ?
    `).get(userId);

    const likeCount = db.prepare(`
        SELECT COUNT(*) as totalLikes
        FROM post_reactions pr
        JOIN posts p ON pr.post_id = p.id
        WHERE p.user_id = ?
        AND pr.type = 'like'
    `).get(userId);

    return {
        totalPosts: postCount.totalPosts,
        totalLikes: likeCount.totalLikes
    };
}


