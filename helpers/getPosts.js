import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import { Like } from "../models/like.js";
import { Comment } from "../models/comment.js";

const userModel = new User();
const likeModel = new Like();
const commentModel = new Comment();
const postModel = new Post();

export const getPosts = async (onSuccess, userId, topicId) => {
  try {
    const posts = await postModel.findMany((post) =>
      userId
        ? post.userId === userId
        : topicId
        ? post.topicId === topicId
        : post
    );
    const postsWithData = await Promise.all(posts.map(fetchDataToPost));
    const descPosts = postsWithData.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    onSuccess(descPosts);
  } catch (error) {
    console.error("Error ensuring topics:", error);
  }
};

const fetchDataToPost = async (post) => {
  const user = await userModel.findMany(
    (foundUser) => foundUser.uid === post.userId
  );
  const likes = await likeModel.findMany((like) => like.postId === post.id);
  const comments = await commentModel.findMany(
    (comment) => comment.postId === post.id
  );
  return {
    ...post,
    user: user && user.length ? user[0] : null,
    comments,
    likes,
  };
};

export const getStorageProfilePosts = () => {
  const postsFromSession = sessionStorage.getItem("profilePosts");
  if (postsFromSession) {
    const parsedPosts = JSON.parse(postsFromSession);
    if (parsedPosts) {
      return parsedPosts.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
    return parsedPosts;
  }
  return null;
};

export const getStorageStoriesPosts = () => {
  const postsFromSession = sessionStorage.getItem("storiesPosts");
  if (postsFromSession) {
    const parsedPosts = JSON.parse(postsFromSession);
    if (parsedPosts) {
      return parsedPosts.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
    return parsedPosts;
  }
  return null;
};
