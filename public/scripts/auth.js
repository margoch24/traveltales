import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "./main.js"


const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User Registered:", userCredential.user);
            return userCredential.user;
        })
        .catch((error) => {
            console.error("Error Signing Up:", error.message);
            return Promise.reject(error);
        });
}

const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User Logged In:", userCredential.user);
            return userCredential.user; // Returns the logged-in user
        })
        .catch((error) => {
            console.error("Error Signing In:", error.message);
            return Promise.reject(error);
        });
}


const logOut = () => {
    return signOut(auth)
        .then(() => {
            console.log("User Logged Out");
        })
        .catch((error) => {
            console.error("Error Logging Out:", error.message);
            return Promise.reject(error);
        });
}

const getCurrentUser = () => {
    return auth.currentUser;
}
