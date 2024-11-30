import { Topic } from "../models/topic.js";
import { TOPICS } from "../helpers/constants.js";

const topicModel = new Topic();

export const getTopics = async (onSuccess) => {
  try {
    const storedTopics = sessionStorage.getItem("topics");
    let topics = storedTopics ? JSON.parse(storedTopics) : null;

    if (!topics || !topics.length) {
      topics = await topicModel.findMany();
      if (!topics.length) {
        topics = await Promise.all(
          TOPICS.map((topic) => topicModel.create(topic))
        );
      }

      sessionStorage.setItem("topics", JSON.stringify(topics));
    }
    onSuccess(topics)
  } catch (error) {
    console.error("Error ensuring topics:", error);
  }
};