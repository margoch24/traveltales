import { getTopics } from "../../helpers/getTopics.js";

const topicsDiv = document.querySelector(".topics");
let direction = 1;
let scrollInterval;

const onDocumentReady = () => {
  getTopics((topics) => {
    displayTopics(topics);
    finishLoading();
    startScrolling();
  });
};

document.addEventListener("DOMContentLoaded", onDocumentReady);

const finishLoading = () => {
  document.querySelector(".loading").classList.add("hidden");
  document.querySelector(".topics").classList.remove("hidden");
};

const displayTopics = (topics) => {
  topicsDiv.innerHTML = "";
  topics.forEach(({ title, imageUrl, id }) => {
    const newHtml = `
            <div class="topic" id="${id}">
                <div class="image" style="background-image: url('${imageUrl}');"></div>
                <div class="topic-text">
                    <h2 class="topic-title">${title}</h2>
                </div>
            </div>
        `;

    topicsDiv.insertAdjacentHTML("beforeend", newHtml);
  });
  setupTopics()
};

const setupTopics = () => {
  const topicsItems = document.querySelectorAll('.topic');
  topicsItems.forEach(topic => {
      topic.addEventListener('click', () => {
        window.location.href = `stories.html?id=${topic.id}`
      })
  })
}

let currentPosition = 0;
const scrollTopics = () => {
  const step = 200;

  const maxScroll = topicsDiv.scrollWidth - topicsDiv.offsetWidth;

  if (currentPosition <= 0 && direction === -1) {
    direction = 1;
  } else if (currentPosition >= maxScroll && direction === 1) {
    direction = -1;
  }

  currentPosition += step * direction;

  topicsDiv.style.transform = `translateX(-${currentPosition}px)`;
};

const startScrolling = () => {
  scrollInterval = setInterval(scrollTopics, 1500);
};

const stopScrolling = () => {
  clearInterval(scrollInterval);
};

topicsDiv.addEventListener("mouseenter", stopScrolling);
topicsDiv.addEventListener("mouseleave", startScrolling);

const handleTryIt = () => {
  window.location.href = "stories.html"
}

const handleProfileOpen = () => {
  window.location.href = "profile.html"
}

window.handleTryIt = handleTryIt;
window.handleProfileOpen = handleProfileOpen;