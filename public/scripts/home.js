import { Topic } from "../../models/topic.js";
import { TOPICS } from "../../helpers/constants.js";

const topicModel = new Topic();
const topicsDiv = document.querySelector(".topics");

let direction = 1;
let scrollInterval;

const getTopics = async () => {
  try {
    let topics = await topicModel.findMany();
    if (!topics.length) {
      topics = await Promise.all(
        TOPICS.map((topic) => topicModel.create(topic))
      );
    }
    displayTopics(topics);
    finishLoading();
    startScrolling();
  } catch (error) {
    console.error("Error ensuring topics:", error);
  }
};

const onDocumentReady = () => {
  getTopics();
};

document.addEventListener("DOMContentLoaded", onDocumentReady);

const finishLoading = () => {
  document.querySelector(".loading").classList.add("hidden");
  document.querySelector(".topics").classList.remove("hidden");
};

const displayTopics = (topics) => {
  topicsDiv.innerHTML = "";
  topics.forEach(({ title, imageUrl, description }) => {
    const newHtml = `
            <div class="topic">
                <div class="image" style="background-image: url('${imageUrl}');"></div>
                <div class="topic-text">
                    <h2 class="topic-title">${title}</h2>
                </div>
            </div>
        `;

    topicsDiv.insertAdjacentHTML("beforeend", newHtml);
  });
};

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
