import { getTopics } from "../../helpers/getTopics.js";
import { getPosts, getStorageStoriesPosts } from "../../helpers/getPosts.js";
import { handleLikeClick, handlePostClick } from "../../helpers/posts.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "./main.js"
import { getStorageUser } from "../../helpers/getUser.js";

const topicsTitlesDiv = document.querySelector(".topics-titles");
const postsDiv = document.querySelector(".posts");
const url = new URL(window.location.href);
const searchParams = new URLSearchParams(url.search);
const topicId = searchParams.get("id");
let posts = getStorageStoriesPosts();
let user = getStorageUser();

const onDocumentReady = () => {
  getTopics((topics) => {
    displayTopicsTitles(topics);
    finishLoading();
    setupBarLinks();
  });

  if (!user) {
    onAuthStateChanged(auth, (newUser) => {
      user = newUser
      setupPosts();
    })
    return
  }
  setupPosts();
};

document.addEventListener("DOMContentLoaded", onDocumentReady);

const setupPosts = () => {
  if (posts && posts.length) {
    finishPostsLoading();
    displayPosts(posts);
    if (topicId) {
      filterPostsByTopic(topicId);
    }
  }

  getPosts((foundPosts) => {
    if (!posts || !posts.length || areDBPostsUpdated(posts, foundPosts)) {
      posts = foundPosts;
      sessionStorage.setItem("storiesPosts", JSON.stringify(foundPosts));
      finishPostsLoading();
      displayPosts(foundPosts);
      if (topicId) {
        filterPostsByTopic(topicId);
      }
    }
  });

  
};

const areDBPostsUpdated = (posts, foundPosts) => {
  if (posts.length !== foundPosts.length) {
    return true;
  }

  return posts.some((post) => {
    const foundPost = foundPosts.find(foundPost => foundPost.id === post.id);
    return foundPost.likes.length !== post.likes.length || foundPost.comments.length !== post.comments.length;
  });
}

const finishLoading = () => {
  document.querySelector(".loading").classList.add("hidden");
  topicsTitlesDiv.classList.remove("hidden");
};

const finishPostsLoading = () => {
  document.querySelector(".posts-loading").classList.add("hidden");
};

const displayTopicsTitles = (topics) => {
  topicsTitlesDiv.innerHTML = "";
  topics.forEach(({ title, id }) => {
    const newHtml = `
          <div class="bar-link" id="${id}">
              <h4>${title}</h4>
              <i class="bi bi-arrow-right-circle"></i>
          </div>
      `;

    topicsTitlesDiv.insertAdjacentHTML("beforeend", newHtml);
  });
};

const setupBarLinks = () => {
  if (topicId) {
    document.querySelector(".bar-link.selected").classList.remove("selected");
    document.querySelector(`#${topicId}.bar-link`).classList.add("selected");
  }

  const barLinks = document.querySelectorAll(".bar-link");
  barLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".bar-link.selected").classList.remove("selected");
      link.classList.add("selected");
      filterPostsByTopic(link.id);
    });
  });
};

const displayPosts = (foundPosts) => {
  if (!foundPosts || !foundPosts.length) {
    postsDiv.classList.add("hidden");
    document.querySelector(".no-posts-text").classList.remove("hidden");
    return;
  }
  postsDiv.classList.remove("hidden");
  document.querySelector(".no-posts-text").classList.add("hidden");
  postsDiv.innerHTML = "";
  foundPosts.forEach(displayOnePost);

  handlePostClick(user, "storiesPosts", (newPosts) => {
    posts = newPosts
  })
  handleLikeClick(user, "storiesPosts", (newPosts) => {
    posts = newPosts
  })
};

const displayOnePost = ({
  createdAt,
  description,
  title,
  user: postUser,
  id,
  imageUrl,
  comments,
  likes
}) => {
  const date = new Date(createdAt);
  const dateString = `${date.toDateString()}, ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const isLikedByUser = user ? likes.filter(like => like.userId === user.uid).length > 0 : false;

  const newHtml = `
      <div class="post" id="${id}" style="${
    imageUrl ? "max-width: 600px;margin:auto" : ""
  }">
          ${imageUrl ? `<img src="${imageUrl}" />` : ""}
          <div class="post-text">
              <h5 class="date">${dateString}</h5>
              <h3 class="post-title">${title}</h3>
              <h4 class="post-description">${description}</h4>
              <div class="flex-container justify-between bottom-section">
                  <div class="flex-container">
                      <i class="bi bi-person-circle"></i>
                      <h4 class="post-h4">${postUser.displayName}</h4>
                  </div>
                  <div class="flex-container right-side">
                      <i class="bi bi-chat"></i>
                      <h4 class="post-h4 comments">${comments.length}</h4>
                      <i style="margin-left: 15px" class="bi ${isLikedByUser ? "bi-heart-fill" : "bi-heart"} like-content"></i>
                      <h4 class="post-h4 likes like-content">${likes.length}</h4>
                  </div>
              </div>
          </div>
      </div>
  `;

  postsDiv.insertAdjacentHTML("afterbegin", newHtml);
};

const filterPostsByTopic = (selectedTopic) => {
  const newPosts = posts.filter(({ topicId }) =>
    selectedTopic === "main" ? topicId : topicId === selectedTopic
  );
  displayPosts(newPosts);
};
