import { Like } from "../models/like.js";
import { Comment } from "../models/comment.js";
import { getStorageProfilePosts, getStorageStoriesPosts } from "../helpers/getPosts.js";


const commentModel = new Comment();
const likeModel = new Like();

const modalElement = document.querySelector("#viewPostComments");
const modal = new bootstrap.Modal(modalElement);

const commentsDiv = modalElement.querySelector(".comments-section")

let clickedPost = null;
let currentUser = null;
let newKey = null;
let onSuccessFun = null;

const button = modalElement.querySelector(".add-new-comment");
button.addEventListener("click", async () => {
    await addNewComment(clickedPost, currentUser)
})

export const handlePostClick = (user, key, onSuccess) => {
    document.querySelectorAll(".post").forEach((post) => {
      post.addEventListener("click", () => {
        let posts = getStorageStoriesPosts()
        if (!posts || !posts.length) {
            posts = getStorageProfilePosts();
        }

        const foundPost = posts.find(item => item.id === post.id);
        if (!foundPost) {
            return;
        }
        modalElement.querySelector(".modal-title").textContent = foundPost.title;

        if (user) {
            modalElement.querySelector(".add-comment-section").classList.remove("hidden")
        } else {
            modalElement.querySelector(".add-comment-section").classList.add("hidden")
        }

        clickedPost = foundPost
        currentUser = user
        newKey = key
        onSuccessFun = onSuccess

        if (!foundPost.comments || !foundPost.comments.length) {
            modalElement.querySelector(".no-comments").classList.remove("hidden");
            commentsDiv.classList.add("hidden");
            commentsDiv.innerHTML = "";
            modal.show()
            return;
        }

        displayComments(foundPost.comments)
        modal.show()
      });
    });
}
  
export const handleLikeClick = (user, key, onSuccess) => {
    document.querySelectorAll(".post .like-content").forEach((like) => {
      like.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (!user) {
            window.location.href = "auth.html";
            return
        }

        newKey = key
        onSuccessFun = onSuccess
        
        const parent = like.closest(".post");
        const notLikedHeart = parent.querySelector(".bi-heart")
        const likesText = parent.querySelector(".likes");
        let likesNumber = parseInt(likesText.textContent);
        if (notLikedHeart) {
            notLikedHeart.classList.replace("bi-heart", "bi-heart-fill");
            likesText.textContent = likesNumber + 1;
            await addLike(parent.id, user);
            return;
        }
        const likedHeart = parent.querySelector(".bi-heart-fill");
        if (likedHeart) {
            likedHeart.classList.replace("bi-heart-fill", "bi-heart");
            likesText.textContent = likesNumber - 1;
            await removeLike(parent.id, user)
        }
      });
    });
}

const addNewComment = async (foundPost, user) => {
    const storiesPosts = getStorageStoriesPosts()
    const profilePosts = getStorageProfilePosts();

    const comment = document.querySelector('#comment-input').value;
    if (!comment) {
        return
    }
    const commentParams = {
        user: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email
        },
        comment,
        postId: foundPost.id,
        createdAt: new Date().toISOString()
    }

    try {
        const newComment = await commentModel.create(commentParams);
        displayOneComment(newComment)
        document.querySelector('#comment-input').value = ""

        const parentPost = document.querySelector(`#${foundPost.id}.post`)
        const commentsText = parentPost.querySelector(".comments");
        let commentsNumber = parseInt(commentsText.textContent);
        commentsText.textContent = commentsNumber + 1

        if (storiesPosts) {
            updatePostsAddComment(storiesPosts, "storiesPosts", newComment, foundPost.id);
        }
        if (profilePosts) {
            updatePostsAddComment(profilePosts, "profilePosts", newComment, foundPost.id);
        }
    } catch (error) {
        console.log(error)
    }

}

const addLike = async (postId, user) => {
    const storiesPosts = getStorageStoriesPosts()
    const profilePosts = getStorageProfilePosts();

    const likeParams = {
        postId,
        userId: user.uid
    }
    try {
        const like = await likeModel.create(likeParams);
        if (storiesPosts) {
            updatePostsAddLike(storiesPosts, "storiesPosts", like, postId);
        }
        if (profilePosts) {
            updatePostsAddLike(profilePosts, "profilePosts", like, postId);
        }
    } catch (error) {
        console.log(error)
    }
}

const removeLike = async (postId, user) => {
    const storiesPosts = getStorageStoriesPosts()
    const profilePosts = getStorageProfilePosts();

    try {
        let likeToDelete = null
        if (storiesPosts) {
            likeToDelete = updatePostsDeleteLike(storiesPosts, "storiesPosts", postId, user);
        }
        if (profilePosts) {
            likeToDelete = updatePostsDeleteLike(profilePosts, "profilePosts", postId, user);
        }

        if (likeToDelete) {
            await likeModel.deleteOne(likeToDelete.id);
        }
    } catch (error) {
        console.log(error)
    }
}

const updatePostsAddLike = (posts, sessionKey, like, postId) => {
    const post = posts.find(item => item.id === postId);
    post.likes.push(like)
    const updatedPosts = posts.map(item =>
        item.id === postId ? post : item
    );

    if (newKey === sessionKey) {
        onSuccessFun(updatedPosts)
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedPosts));
}

const updatePostsDeleteLike = (posts, sessionKey, postId, user) => {
    const post = posts.find(item => item.id === postId);
    const likeToDelete = post.likes.find(like => like.userId === user.uid);
    const newLikes = post.likes.filter(like => like.userId !== user.uid);
    const updatedPosts = posts.map(item =>
        item.id === postId ? { ...post, likes: newLikes } : item
    );
    if (newKey === sessionKey) {
        onSuccessFun(updatedPosts)
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedPosts));

    return likeToDelete
}

const updatePostsAddComment = (posts, sessionKey, comment, postId) => {
    const post = posts.find(item => item.id === postId);
    if (!post) {
        return
    }
    post.comments.push(comment)
    const updatedPosts = posts.map(item =>
        item.id === postId ? post : item
    );
    if (newKey === sessionKey) {
        onSuccessFun(updatedPosts)
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedPosts));
}

const displayComments = (comments) => {
    commentsDiv.innerHTML = "";
    comments.forEach(displayOneComment);
}

const displayOneComment = (comment) => {
    modalElement.querySelector(".no-comments").classList.add("hidden");
    commentsDiv.classList.remove("hidden");

    const date = new Date(comment.createdAt);
    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    const formattedDate = dateFormatter.format(date);
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formattedTime = timeFormatter.format(date);
    const result = `${formattedDate}, ${formattedTime}`;

    const newHtml = `
        <div class="comment">
            <div class="flex-container">
                <i class="bi bi-person-circle"></i>
                <h4>${comment.user.displayName}</h4>
            </div>
            <h5>${comment.comment}</h5>
            <h6>${result}</h6>
        </div>
    `;

    commentsDiv.insertAdjacentHTML("afterbegin", newHtml);
}