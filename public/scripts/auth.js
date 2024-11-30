import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "./main.js"
import { User } from "../../models/user.js";

const userModel = new User();

const alert = document.querySelector('.alert')

const signUp = (email, password, name) => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            userModel.create({
                displayName: name,
                email: userCredential.user.email,
                uid: userCredential.user.uid
            })
            return updateProfile(userCredential.user, {
                displayName: name
            }).then(() => {
                window.location.href = "index.html";
                return userCredential.user;
            });
        })
        .catch((error) => {
            alert.textContent = "Internal server error";
            if (error.code === "auth/email-already-in-use") {
                alert.textContent = "Email address is already in use";
            }
            alert.classList.remove("hidden")
            return Promise.reject(error);
        });
}

const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "index.html"
            return userCredential.user;
        })
        .catch((error) => {
            alert.textContent = "Intenal server error";
            if (error.code === "auth/invalid-login-credentials") {
                alert.textContent = "Your password or email is wrong";
            }
            
            alert.classList.remove("hidden")
            return Promise.reject(error);
        });
}

const handleLogin = () => {
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;

    if (!email || !isEmailValid(email) || !password || password.length < 6) {
        alert.textContent = "Please enter valid values (Password at least 6 characters)";
        alert.classList.remove("hidden");
        return;
    }

    signIn(email, password)
}

const handleRegister = () => {
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const name = document.querySelector('#username').value;

    if (!email || !isEmailValid(email) || !password || password.length < 6 || !name) {
        alert.textContent = "Please enter valid values. (Password at least 6 characters)";
        alert.classList.remove("hidden");
        return;
    }

    signUp(email, password, name)
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;

const checkbox = document.querySelector('input[name="password_shown"]');
const passwordInput = document.querySelector('#password');

checkbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        passwordInput.type = 'text';
        return;
    }
    passwordInput.type = 'password';
});

const isEmailValid = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

document.querySelector('#password').addEventListener('input', () => {
    alert.classList.add("hidden")
});

document.querySelector('#email').addEventListener('input', () => {
    alert.classList.add("hidden")
});