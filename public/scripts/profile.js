import { signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "./main.js";

import { Post } from "../../models/post.js";
import { getStorageUser } from "../../helpers/getUser.js";
import { getTopics } from "../../helpers/getTopics.js";
import { getPosts, getStorageProfilePosts } from "../../helpers/getPosts.js";

const postModel = new Post();

const profilePostsDiv = document.querySelector(".profile-posts");
const alert = document.querySelector(".alert");
const user = getStorageUser();
const modalElement = document.querySelector("#addNewPost");
const modal = new bootstrap.Modal(modalElement);

let posts = getStorageProfilePosts();
let chosenTopic = null;

const setupDropdownTopics = () => {
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  const dropdownButton = document.getElementById("dropdownMenuButton");

  dropdownItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      dropdownButton.textContent = item.textContent;
      chosenTopic = item.id;
      alert.classList.add("hidden");
    });
  });
};

const addTitlesToDropdown = (topics) => {
  const dropdownMenu = document.querySelector(".dropdown-menu");
  topics.forEach(({ title, id }) => {
    const newHtml = `<div class="dropdown-item" id="${id}">${title}</div>`;

    dropdownMenu.insertAdjacentHTML("beforeend", newHtml);
  });
};

const finishLoading = () => {
  document.querySelector(".loading").classList.add("hidden");
  document.querySelector(".no-posts-text").classList.remove("hidden");
};

const displayPosts = () => {
  posts.forEach(displayOnePost);
};

const displayOnePost = ({
  createdAt,
  description,
  title,
  user: postUser,
  id,
  imageUrl,
}) => {
  const date = new Date(createdAt);
  const dateString = `${date.toDateString()}, ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const newHtml = `
      <div class="post" id="${id}">
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
                      <h4 class="post-h4">4</h4>
                      <i style="margin-left: 15px" class="bi bi-heart"></i>
                      <h4 class="post-h4">3</h4>
                  </div>
              </div>
          </div>
          <div class="delete-button">
              <i class="bi bi-trash"></i>
          </div>
      </div>
  `;

  profilePostsDiv.insertAdjacentHTML("afterbegin", newHtml);
  document.querySelector(".no-posts-text").classList.add("hidden");
  profilePostsDiv.classList.remove("hidden");
  document
    .querySelector(`#${id}.post .delete-button`)
    .addEventListener("click", async () => {
      await handleDeletePost(id);
    });
};

const setupPosts = () => {
  if (!posts || !posts.length) {
    getPosts(
      (foundPosts) => {
        posts = foundPosts;
        sessionStorage.setItem("profilePosts", JSON.stringify(foundPosts));
        finishLoading();
        displayPosts();
      },
      user ? user.uid : null
    );
    return;
  }

  finishLoading();
  displayPosts();
};

const logOut = () => {
  return signOut(auth)
    .then(() => {
      sessionStorage.setItem("profilePosts", JSON.stringify(null));
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error Logging Out:", error.message);
      return Promise.reject(error);
    });
};

const handleLogout = () => {
  logOut();
};

const handleCreatePost = () => {
  modal.show();
};

const handleDeletePost = async (postId) => {
  document.querySelector(`#${postId}.post`).remove();
  const newPosts = posts.filter((post) => post.id !== postId);
  posts = newPosts;
  sessionStorage.setItem("profilePosts", JSON.stringify(newPosts));
  try {
    await postModel.deleteOne(postId);
  } catch (error) {
    console.error(error);
  }
};

const handleNewPost = async () => {
  const description = document.querySelector("#description").value;
  const title = document.querySelector("#title").value;
  const fileName = document.querySelector("#filename").value;

  if (!chosenTopic || !description || !title) {
    alert.textContent = "Provide required values";
    alert.classList.remove("hidden");
    return;
  }

  try {
    const postParams = {
      title,
      description,
      topicId: chosenTopic,
      imageUrl: fileName,
      userId: user ? user.uid : null,
      createdAt: new Date().toISOString(),
    };

    const post = await postModel.create(postParams);
    if (post) {
      displayOnePost({ ...post, user });
      posts = [{ ...post, user }, ...posts];
      sessionStorage.setItem("profilePosts", JSON.stringify(posts));
      modal.hide();
      return;
    }

    alert.textContent = "Internal server error";
    alert.classList.remove("hidden");
  } catch (error) {
    console.error(error);
  }
};

window.handleLogout = handleLogout;
window.handleCreatePost = handleCreatePost;
window.handleNewPost = handleNewPost;

document.querySelectorAll("input, textarea").forEach((item) => {
  item.addEventListener("input", () => {
    alert.classList.add("hidden");
  });
});

const onDocumentReady = () => {
  getTopics((topics) => {
    addTitlesToDropdown(topics);
    setupDropdownTopics();
  });

  setupPosts();
};

document.addEventListener("DOMContentLoaded", onDocumentReady);
