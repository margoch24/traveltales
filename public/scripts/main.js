import {
  DATABASE_URL,
  API_KEY,
  AUTH_DOMAIN,
  APP_ID,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  MEASUREMENT_ID,
} from "../../helpers/env.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const appSettings = {
  databaseURL: DATABASE_URL,
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};

const app = initializeApp(appSettings);
export const database = getDatabase(app);
export const auth = getAuth(app);

document.addEventListener("scroll", function () {
  onDocumentScroll();
});

const onDocumentScroll = () => {
  adjustHeader();
};

const adjustHeader = () => {
  const header = document.getElementById("header");
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
    return;
  }
  header.classList.remove("scrolled");
};
