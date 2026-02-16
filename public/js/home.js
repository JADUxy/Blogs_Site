let currentUser = null;
const logstatus = document.getElementById("logstatus");
const feedContainer = document.querySelector(".container > div");







/* ================= AUTH STATUS ================= */

async function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        logstatus.innerText = "Login";
        return null;
    }

    try {
        const res = await fetch("/api/user/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            logstatus.innerText = "Login";
            return null;
        }

        const data = await res.json();
        logstatus.innerText = "Logout";
        return data;

    } catch (err) {
        console.error(err);
        return null;
    }
}

/* ================= LOAD POSTS ================= */

async function loadPosts() {
    const token = localStorage.getItem("token");

    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/posts/logged", { headers });
        const posts = await res.json();

        renderPosts(posts);
        renderRecentPosts(posts);
    } else {
        const res = await fetch("/api/posts", { headers });
        const posts = await res.json();

        renderPosts(posts);
        renderRecentPosts(posts);
    }


}





function renderPosts(posts) {
    feedContainer.innerHTML = "";
    function renderNestedComments(comments, level = 0) {

        return comments.map(comment => {

            const replyClass = level > 0 ? "comment reply" : "comment";

            return `
            <div class="${replyClass}" data-comment-id="${comment.id}">
                
                <div class="comment-header">
                    ${comment.username} • ${comment.time}
                </div>

                ${comment.text}

                <div class="comment-actions">
                    <span class="like-comment">👍 ${comment.likes}</span>
                    <span class="dislike-comment">👎 ${comment.dislikes}</span>
                    <span class="reply-btn">Reply</span>
                </div>

                ${comment.replies && comment.replies.length
                    ? renderNestedComments(comment.replies, level + 1)
                    : ""
                }

            </div>
        `;
        }).join("");
    }
    const localComments = {
        postId1: [
            {
                id: 1,
                username: "Alice",
                text: "Awesome work!",
                time: "1h ago",
                likes: 4,
                dislikes: 0,
                replies: [
                    {
                        id: 2,
                        username: "Bob",
                        text: "Totally agree!",
                        time: "50m ago",
                        likes: 2,
                        dislikes: 0,
                        replies: [
                            {
                                id: 3,
                                username: "Rohit",
                                text: "Thanks guys 😊",
                                time: "40m ago",
                                likes: 1,
                                dislikes: 0,
                                replies: []
                            }
                        ]
                    }
                ]
            }
        ]
    };


    posts.forEach(post => {

        const postEl = document.createElement("div");
        postEl.className = "post";

        // Extract image from content (markdown style ![image](url))
        let imageHtml = "";
        const imageMatch = post.content.match(/!\[image\]\((.*?)\)/);

        if (imageMatch) {
            imageHtml = `<img src="${imageMatch[1]}" />`;
        }

        // Remove image markdown from visible content
        const cleanContent = post.content.replace(/!\[image\]\((.*?)\)/, "");

        // Extract hashtags
        const tags = cleanContent.match(/#\w+/g) || [];
        const tagsHtml = tags.map(tag =>
            `<span class="tag">${tag}</span>`
        ).join("");

        postEl.innerHTML = `
            <div class="post-meta">
                Posted by ${post.username} • 
                ${new Date(post.created_at).toLocaleString()}
            </div>

            <h2>${post.title}</h2>

            ${imageHtml}

            <p>${cleanContent}</p>

            ${tags.length ? `<div class="tags">${tagsHtml}</div>` : ""}

            <div class="actions">
                <button class="like-btn" data-id="${post.id}">
                    👍 ${post.likes_count}
                </button>

                <button class="dislike-btn" data-id="${post.id}">
                    👎 ${post.dislikes_count}
                </button>
            </div>

            <div style="display: flex, gap: 10px">
            <div class="toggle comment-toggle">Show comments</div>
            <div class="toggle">Add </div>
            </div>

<div class="comments" style="display:none;">

    <div class="comment">
        <div class="comment-header">Alice • 1h ago</div>
        Awesome work!

        <div class="comment-actions">
            <span>👍 4</span>
            <span>👎 0</span>
            <span class="reply-btn">Reply</span>
        </div>

        <!-- First Reply -->
        <div class="comment reply">
            <div class="comment-header">Bob • 50m ago</div>
            Totally agree!

            <div class="comment-actions">
                <span>👍 2</span>
                <span class="reply-btn">Reply</span>
            </div>

            <!-- Nested Reply -->
            <div class="comment reply">
                <div class="comment-header">Rohit • 40m ago</div>
                Thanks guys 😊

                <div class="comment-actions">
                    <span>👍 1</span>
                    <span class="reply-btn">Reply</span>
                </div>
            </div>

        </div>
    </div>

</div>


            </div>
        `;

        feedContainer.appendChild(postEl);
    });
}
function renderRecentPosts(posts) {

    const recentContainer = document.getElementById("recentPosts");
    recentContainer.innerHTML = "";

    // Show only latest 5
    const recent = posts.slice(0, 6);

    recent.forEach(post => {

        // Extract image
        let imageUrl = "https://picsum.photos/100/100?random=" + post.id;
        const imageMatch = post.content.match(/!\[image\]\((.*?)\)/);
        if (imageMatch) {
            imageUrl = imageMatch[1];
        }

        const miniPost = document.createElement("div");
        miniPost.className = "mini-post";

        miniPost.innerHTML = `
            <img src="${imageUrl}">
            <div>
                ${post.title}
                <div class="read-more" data-id="${post.id}">
                    Read more →
                </div>
            </div>
        `;

        recentContainer.appendChild(miniPost);
    });
}


/* ================= LIKE / DISLIKE ================= */

document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("like-btn") ||
        e.target.classList.contains("dislike-btn")) {

        if (!localStorage.getItem("token")) {
            alert("Please login first");
            return;
        }

        const postId = e.target.dataset.id;
        const type = e.target.classList.contains("like-btn")
            ? "like"
            : "dislike";

        await fetch(`/api/posts/${postId}/react`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ type })
        });

        loadPosts(); // reload after reaction
    }

});

/* ================= TOGGLE COMMENTS ================= */



/* ================= LOGIN / LOGOUT ================= */

logstatus.addEventListener("click", () => {
    if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
        location.reload();
    } else {
        window.location.href = "login.html";
    }
});

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await checkAuth();
    await loadPosts();
});



const topUsername = document.getElementById("topUsername");
const userName = document.getElementById("userName");

async function checkAuth2() {
    const token = localStorage.getItem("token");

    if (!token) {
        logstatus.innerText = "Login";
        topUsername.innerText = "Please Login";
        return null;
    }

    try {
        const res = await fetch("/api/user/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            logstatus.innerText = "Login";
            topUsername.innerText = "Please Login";
            return null;
        }

        const data = await res.json();

        logstatus.innerText = "Logout";
        topUsername.innerText = data.user.username;

        return data.user;

    } catch (err) {
        console.error(err);
        topUsername.innerText = "Please Login";
        return null;
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    await checkAuth2();
    await loadUserStats();
});
async function loadUserStats() {
    const token = localStorage.getItem("token");

    if (!token) {
        document.getElementById("sidebarUsername").innerText = "Guest";
        return;
    }

    const res = await fetch("/api/user/stats", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("sidebarUsername").innerText = topUsername.innerText;
    document.getElementById("sidebarPosts").innerText = data.totalPosts;
    document.getElementById("sidebarLikes").innerText = data.totalLikes;
}
document.getElementById("sidebarUsername")
    .addEventListener("click", () => {
        window.location.href = "user.html";
    });

const searchInput = document.querySelector(".search input");
searchInput.addEventListener("keydown", async (e) => {

    if (e.key === "Enter") {

        const keyword = searchInput.value.trim();

        if (!keyword) return;

        const res = await fetch(`/api/posts/search/${encodeURIComponent(keyword)}`);
        const posts = await res.json();
        console.log(posts)
        renderPosts(posts.posts); // your existing render function
    }
});

function renderNestedComments(comments, postId, level = 0) {

    return comments.map(comment => {

        return `
            <div class="comment ${level > 0 ? 'reply' : ''}">
                
                <div class="comment-header">
                    ${comment.username} • 
                    ${new Date(comment.created_at).toLocaleString()}
                </div>

                ${comment.content}

                <div class="comment-actions" post-id=${postId}>
                    <span class="reply-btn" post-id=${postId} data-id="${comment.id}">
                        Reply
                    </span>
                </div>

                ${comment.replies && comment.replies.length > 0
                ? renderNestedComments(comment.replies, postId, level + 1)
                : ""
            }

            </div>
        `;

    }).join("");
}

async function addComments(e) {

    if (e.target.classList.contains("submit-reply")) {

        if (!localStorage.getItem("token")) {
            alert("Please login first");
            return;
        }

        const replyBox = e.target.closest(".reply-box");
        const input = replyBox.querySelector("input");
        const content = input.value.trim();

        if (!content) return;

        const payload = {
            postId: e.target.getAttribute("post_id"),
            parentId: e.target.getAttribute("comment_id"),
            content: content
        }
        console.log(payload);

        try {
            const res = await fetch("http://localhost:3000/api/posts/createComment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.status) {
                alert("Failed to post comment");
                return;
            }

            // reload comments after success

            const postId = e.target.getAttribute("post_id");

            // Find the CURRENT post in DOM (not using old reference)
            const postEl = document.querySelector(`.like-btn[data-id="${postId}"]`)
                ?.closest(".post");

            if (!postEl) return;

            const commentsDiv = postEl.querySelector(".comments");
            const toggleBtn = postEl.querySelector(".comment-toggle");

            await updateComments(commentsDiv, postId, toggleBtn);


        } catch (err) {
            console.error(err);
        }
    }

}

async function addComentRoot(postId, content) {
    const payload = {
        "content": content,
        "postId": postId,
        "parentId": undefined
    }


    const req = await fetch("http://localhost:3000/api/posts/createComment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload)
    })

    const data = req.json();




}
async function handleAddRootCommment(e) {
    console.log(e);
    console.log(e.target)
    console.log(e.target.parentNode);
    console.log();
    console.log();
    await addComentRoot(e.target.getAttribute("post_id"), e.target.parentNode.childNodes[1].value);
}
document.addEventListener("click", async function (e) {
    if (e.target.id === "addRootCommentBtn") {
        handleAddRootCommment(e);

        const postId = e.target.getAttribute("post_id");

        // Find the CURRENT post in DOM (not using old reference)
        const postEl = document.querySelector(`.like-btn[data-id="${postId}"]`)
            ?.closest(".post");

        if (!postEl) return;

        const commentsDiv = postEl.querySelector(".comments");
        const toggleBtn = postEl.querySelector(".comment-toggle");

        await updateComments(commentsDiv, postId, toggleBtn);

    }
});
async function updateComments(commentsDiv, postId, toggleBtn) {
    try {
        const res = await fetch(`/api/posts/comments/${postId}`);
        const data = await res.json();

        if (!data.status) {
            commentsDiv.innerHTML = "<p>Failed to load comments</p>";
        } else {

            commentsDiv.innerHTML = renderNestedComments(data.comments, postId);
        }

        const rootComment = document.createElement("div");
        rootComment.innerHTML = `
<div class="add-root-comment">
    <textarea 
        id="rootCommentInput" 
        placeholder="Write a comment..." 
        rows="2"
    ></textarea>

    <button post_id=${postId}  id="addRootCommentBtn">
        Post Comment
    </button>
</div>
        `

        commentsDiv.appendChild(rootComment);


        commentsDiv.style.display = "block";
        toggleBtn.innerText = "Hide comments";

    } catch (err) {
        console.error(err);
        commentsDiv.innerHTML = "<p>Error loading comments</p>";
        commentsDiv.style.display = "block";
    }
}
async function showComment(e) {
    if (!e.target.classList.contains("comment-toggle")) return;
    console.log("i am inside toggle");

    const toggleBtn = e.target;
    const commentsDiv = toggleBtn.parentNode.nextElementSibling;
    const postEl = toggleBtn.closest(".post");

    // Get post id from like button (since you already store it there)
    const postId = postEl.querySelector(".like-btn")?.dataset.id;

    // // Toggle closed
    if (commentsDiv.style.display === "block") {
        commentsDiv.style.display = "none";
        toggleBtn.innerText = "Show comments";
        return;
    }

    updateComments(commentsDiv, postId, toggleBtn);
}
document.addEventListener("click", async function (e) {

    addComments(e);
    showComment(e);


});




/* ================= RENDER POSTS ================= */
document.addEventListener("click", function (e) {

    // When clicking Reply
    if (e.target.classList.contains("reply-btn")) {
        console.log("clicked")

        const commentEl = e.target.closest(".comment");

        // Prevent multiple input boxes
        if (commentEl.querySelector(".reply-box")) return;

        const replyBox = document.createElement("div");
        replyBox.className = "reply-box";
        console.log(e.target.innerHTML);
        console.log(e.target.getAttribute("post-id"));
        console.log(e.target.getAttribute("data-id"));
        console.log(e.target.attributes["post-id"][0]);

        replyBox.innerHTML = `
            <input type="text" placeholder="Write a reply..." />
            <button comment_id=${e.target.getAttribute("data-id")} post_id=${e.target.getAttribute("post-id")} class="submit-reply">Post</button>
        `;

        commentEl.appendChild(replyBox);
    }

    // When clicking Post inside reply box
    if (e.target.classList.contains("submit-reply")) {

        const replyBox = e.target.closest(".reply-box");
        const input = replyBox.querySelector("input");
        const text = input.value.trim();

        if (!text) return;

        const commentEl = e.target.closest(".comment");

        const newReply = document.createElement("div");
        newReply.className = "comment reply";

        newReply.innerHTML = `
            <div class="comment-header">
                You • Just now
            </div>
            ${text}
            <div class="comment-actions">
                <span>👍 0</span>
                <span>Reply</span>
            </div>
        `;

        commentEl.appendChild(newReply);

    }
});