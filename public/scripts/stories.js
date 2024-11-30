import { getTopics } from "../../helpers/getTopics.js";
import { getPosts } from "../../helpers/getPosts.js";

const topicsTitlesDiv = document.querySelector(".topics-titles");
const postsDiv = document.querySelector(".posts");
const url = new URL(window.location.href);
const searchParams = new URLSearchParams(url.search);
const topicId = searchParams.get("id");
let posts = [];

const onDocumentReady = () => {
  getTopics((topics) => {
    displayTopicsTitles(topics);
    finishLoading();
    setupBarLinks();
  });

  getPosts((foundPosts) => {
    posts = foundPosts;
    finishPostsLoading();
    displayPosts(foundPosts);
    if (topicId) {
      filterPostsByTopic(topicId);
    }
  });
};

document.addEventListener("DOMContentLoaded", onDocumentReady);

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
                      <h4 class="post-h4">4</h4>
                      <i style="margin-left: 15px" class="bi bi-heart"></i>
                      <h4 class="post-h4">3</h4>
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
