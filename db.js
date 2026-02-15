import Database from "better-sqlite3";
const db = new Database("./database/blog.db");
db.pragma("foreign_keys = ON")

console.log("sqlite connected")


db.exec(`
  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,

  otp TEXT,
  otp_expiry INTEGER,
  is_verified INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);





  /*
  |--------------------------------------------------------------------------
  | POSTS
  |--------------------------------------------------------------------------
  */
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* post likes */
CREATE TABLE IF NOT EXISTS post_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('like', 'dislike')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);



  /*
  |--------------------------------------------------------------------------
  | COMMENTS
  |--------------------------------------------------------------------------
  | One post → many comments
  | One user → many comments
  |--------------------------------------------------------------------------
  */
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER REFERENCES comments(id),
    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE
  );


  /*
  |--------------------------------------------------------------------------
  | LIKES (junction table)
  |--------------------------------------------------------------------------
  | many-to-many (user ↔ post)
  | one user can like a post only once
  |--------------------------------------------------------------------------
  */
  CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, post_id),

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE
  );
`);


console.log("table created");

export default db;