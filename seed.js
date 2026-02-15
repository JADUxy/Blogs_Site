import db from "./db.js";

export default function seedDatabase() {
  const seed = db.transaction(() => {

    console.log("Seeding database...");

    // Clear existing data (for repeatable testing)
    db.prepare(`DELETE FROM post_reactions`).run();
    db.prepare(`DELETE FROM comments`).run();
    db.prepare(`DELETE FROM posts`).run();
    db.prepare(`DELETE FROM users`).run();

    /*
    |----------------------------------------------------------
    | 1️⃣ USERS
    |----------------------------------------------------------
    */
    const insertUser = db.prepare(`
      INSERT INTO users (email, username, password_hash, is_verified)
      VALUES (?, ?, ?, 1)
    `);

    insertUser.run("rohit@test.com", "rohit", "hashed_password");
    insertUser.run("anita@test.com", "anita", "hashed_password");
    insertUser.run("rahul@test.com", "rahul", "hashed_password");

    /*
    |----------------------------------------------------------
    | 2️⃣ POSTS
    |----------------------------------------------------------
    */
    const insertPost = db.prepare(`
      INSERT INTO posts (title, content, user_id)
      VALUES (?, ?, ?)
    `);

    insertPost.run("First Post", "This is Rohit's first blog post", 1);
    insertPost.run("Learning Node.js", "Backend is getting interesting!", 1);
    insertPost.run("SQLite Tips", "Better-SQLite3 is very fast.", 2);
    insertPost.run("System Design Basics", "Let’s understand relationships.", 3);

    /*
    |----------------------------------------------------------
    | 3️⃣ REACTIONS
    |----------------------------------------------------------
    */
    const insertReaction = db.prepare(`
      INSERT INTO post_reactions (post_id, user_id, type)
      VALUES (?, ?, ?)
    `);

    // Post 1
    insertReaction.run(1, 2, "like");
    insertReaction.run(1, 3, "like");

    // Post 2
    insertReaction.run(2, 2, "dislike");

    // Post 3
    insertReaction.run(3, 1, "like");
    insertReaction.run(3, 3, "like");

    // Post 4
    insertReaction.run(4, 1, "dislike");

    /*
    |----------------------------------------------------------
    | 4️⃣ COMMENTS
    |----------------------------------------------------------
    */
   // Reply C
   /*
|----------------------------------------------------------
| 4️⃣ COMMENTS
|----------------------------------------------------------
*/

const insertComment = db.prepare(`
  INSERT INTO comments (content, user_id, post_id, parent_id)
  VALUES (?, ?, ?, ?)
`);

// ----------------------
// Post 1 - Thread 1
// ----------------------

// Top-level Comment 1 (Rohit)
const c1 = insertComment.run(
  "Really happy with how this post turned out!",
  1,
  1,
  null
);

// Reply A (Anita)
const c1_reply1 = insertComment.run(
  "It’s actually very well written 👌",
  2,
  1,
  c1.lastInsertRowid
);

// Nested Reply (Rahul)
insertComment.run(
  "Agreed! The explanation was clear.",
  3,
  1,
  c1_reply1.lastInsertRowid
);

// Reply B (Rahul)
insertComment.run(
  "Looking forward to your next post!",
  3,
  1,
  c1.lastInsertRowid
);

// ----------------------
// Post 1 - Thread 2
// ----------------------

// Top-level Comment 2 (Anita)
const c2 = insertComment.run(
  "Can you write more about backend architecture?",
  2,
  1,
  null
);

// Reply C (Rohit)
insertComment.run(
  "Yes! I’ll write a detailed one soon.",
  1,
  1,
  c2.lastInsertRowid
);

// ----------------------
// Post 2 - Simple Comment
// ----------------------

insertComment.run(
  "Node.js async flow is very powerful once understood.",
  3,
  2,
  null
);


  });



  seed();
}
