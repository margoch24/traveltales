import { auth } from "../public/scripts/main.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const homeLogIn = document.querySelector(".home-log-in");
const homeProfile = document.querySelector(".home-profile");
const profileUsername = document.querySelector(".profile-content .username");

export const getStorageUser = () => {
    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
        return JSON.parse(userFromSession);
    }
    return null
}

const setUserHomePage = (user) => {
    if (homeLogIn) {
        homeLogIn.classList.add('hidden');
    }

    if (homeProfile) {
        homeProfile.classList.remove("hidden")
        document.querySelector(".home-profile h4").textContent = user.displayName
    }

    if (profileUsername) {
        profileUsername.textContent = user.displayName
    }
}

const removeUserHomePage = () => {

    if (window.location.pathname.includes("/profile.html")) {
        window.location.href = "auth.html";
    }

    if (homeLogIn) {
        homeLogIn.classList.remove('hidden');
    }

    if (homeProfile) {
        homeProfile.classList.add("hidden")
    }
}

const getUser = () => {
    const user = getStorageUser()
    if (user) {
        setUserHomePage(user);
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            sessionStorage.setItem("user", JSON.stringify(user));
            setUserHomePage(user);
            return;
        }

        sessionStorage.removeItem("user");
        removeUserHomePage();
    });
}

getUser();