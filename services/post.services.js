import db from "../db.js";

export function createPost(title, content, userId) {
    return db.prepare(`
        INSERT INTO posts (title, content, user_id)
        VALUES (?, ?, ?)
    `).run(title, content, userId);
}

export function getAllPosts(userId) {
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

        GROUP BY posts.id

        ORDER BY posts.created_at DESC
    `).all(userId, userId);
}
export function getAllUserPosts(userId, currentUserId) {
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
    `).all(currentUserId, currentUserId, userId);
}


export function getPostById(id, currentUserId) {
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
    `).get(currentUserId, currentUserId, id);
}

export function getPostByIdPublic(id) {
    return db.prepare(`
        SELECT 
            posts.*,
            users.username,

            COUNT(CASE WHEN post_reactions.type = 'like' THEN 1 END) 
                AS likes_count,

            COUNT(CASE WHEN post_reactions.type = 'dislike' THEN 1 END) 
                AS dislikes_count

        FROM posts

        JOIN users 
            ON posts.user_id = users.id

        LEFT JOIN post_reactions 
            ON posts.id = post_reactions.post_id

        WHERE posts.id = ?

        GROUP BY posts.id
    `).get(id);
}



export function updatePost(id, title, content) {
    return db.prepare(`
        UPDATE posts
        SET title=?, content=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).run(title, content, id);
}


export function deletePost(id) {
    const deleteReactions = db.prepare(`
        DELETE FROM post_reactions WHERE post_id = ?
    `);

    const deletePost = db.prepare(`
        DELETE FROM posts WHERE id = ?
    `);

    const transaction = db.transaction((postId) => {
        deleteReactions.run(postId);
        deletePost.run(postId);
    });

    return transaction(id);
}

export function toggleReaction(postId, userId, type) {

    const existing = db.prepare(`
        SELECT * FROM post_reactions
        WHERE post_id = ? AND user_id = ?
    `).get(postId, userId);

    if (!existing) {
        // Insert new reaction
        db.prepare(`
            INSERT INTO post_reactions (post_id, user_id, type)
            VALUES (?, ?, ?)
        `).run(postId, userId, type);

    } else if (existing.type === type) {
        // Same reaction clicked again → remove it
        db.prepare(`
            DELETE FROM post_reactions
            WHERE post_id = ? AND user_id = ?
        `).run(postId, userId);

    } else {
        // Switch reaction
        db.prepare(`
            UPDATE post_reactions
            SET type = ?
            WHERE post_id = ? AND user_id = ?
        `).run(type, postId, userId);
    }

    // Return updated counts
    return db.prepare(`
        SELECT
            COUNT(CASE WHEN type='like' THEN 1 END) AS likes_count,
            COUNT(CASE WHEN type='dislike' THEN 1 END) AS dislikes_count
        FROM post_reactions
        WHERE post_id = ?
    `).get(postId);
}

export function searchPosts(keyword) {
    const likePattern = `%${keyword}%`;

    const posts = db.prepare(`
        SELECT posts.*, users.username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.title LIKE ?
           OR posts.content LIKE ?
        ORDER BY posts.created_at DESC
    `).all(likePattern, likePattern);
    return posts;
}


export async function createReply(req, res) {
    const { content, parent_id } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    await db.run(`
        INSERT INTO comments (content, user_id, post_id, parent_id)
        VALUES (?, ?, ?, ?)
    `, [content, userId, postId, parent_id]);

    res.json({ success: true });
}
export function getComments(postId) {

    const comments = db.prepare(`
        SELECT 
            comments.id,
            comments.content,
            comments.parent_id,
            comments.created_at,
            users.username
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    `).all(postId);

    return comments;
}


export function createComment(content, userId, postId, parentId = null) {

    const sql = `
        INSERT INTO comments (content, user_id, post_id, parent_id)
        VALUES (?, ?, ?, ?)
    `;

    const stmt = db.prepare(sql);

    const result = stmt.run(
        content,
        userId,
        postId,
        parentId
    );

    return {
        id: result.lastInsertRowid,
        content,
        user_id: userId,
        post_id: postId,
        parent_id: parentId
    };
}


