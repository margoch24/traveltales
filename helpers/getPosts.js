import { Post } from "../../models/post.js";
import { User } from "../../models/user.js";

const userModel = new User();
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
    const postsWithUser = await Promise.all(posts.map(fetchUserToPost))
    const descPosts = postsWithUser.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    });
    onSuccess(descPosts);
  } catch (error) {
    console.error("Error ensuring topics:", error);
  }
};

const fetchUserToPost = async (post) => {
    const user = await userModel.findMany((foundUser) => foundUser.uid === post.userId);
    return { ...post, user: user && user.length ? user[0] : null }
}

export const getStorageProfilePosts = () => {
    const postsFromSession = sessionStorage.getItem("profilePosts");
    if (postsFromSession) {
        const parsedPosts = JSON.parse(postsFromSession);
        if (parsedPosts) {
            return parsedPosts.sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            });
        }
        return parsedPosts
    }
    return null
}

