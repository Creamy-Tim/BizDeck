// ================= Firebase SDK import =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ================= Firebase 초기화 =================
const firebaseConfig = {
    apiKey: "AIzaSyChGzlnFvC5vFhqxqDyP-ZNFirvSxzI0Z0",
    authDomain: "bizdeck-9fae5.firebaseapp.com",
    projectId: "bizdeck-9fae5",
    storageBucket: "bizdeck-9fae5.firebasestorage.app",
    messagingSenderId: "947125248466",
    appId: "1:947125248466:web:255f15e2555a7e43a5a80b",
    measurementId: "G-RQ7KHXBP6J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= 기본값 =================
const DEFAULT_CARD = {
    name: "Name",
    title: "Job",
    phone: "010-0000-0000",
    email: "Email",
    website: "Website",
};

// ================= DOM 요소 =================
const nameEl = document.querySelector(".my_name_text");
const titleEl = document.querySelector(".my_job_text");
const contactNodes = document.querySelectorAll(".contact_text_text");
const contactEl = contactNodes[0];
const emailEl = contactNodes[1];
const websiteEl = contactNodes[2];

const friendsWrapEl = document.getElementById("friends_cards");

// ================= 내 명함 불러오기 =================
async function loadProfile(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    nameEl.textContent = data.nickname || DEFAULT_CARD.name;
    titleEl.textContent = data.title || DEFAULT_CARD.title;
    contactEl.textContent = data.phone || DEFAULT_CARD.phone;
    emailEl.textContent = data.email || DEFAULT_CARD.email;
    websiteEl.textContent = data.website || DEFAULT_CARD.website;

    document.querySelectorAll('.my_card').forEach(card => {
        if (data.card_color) card.style.background = data.card_color;
    });
}

// ================= 친구 명함 불러오기 =================
async function loadFriends(uid) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const friendUids = userSnap.data().friends || [];

    friendsWrapEl.innerHTML = "";

    for (const f of friendUids) {
        const ref = doc(db, "users", f);
        const snap = await getDoc(ref);

        if (!snap.exists()) continue;

        const data = snap.data();
        const card = document.createElement("div");
        card.className = "friend_card";

        if (data.card_color) card.style.background = data.card_color;

        card.innerHTML = `
            <div class="my_name"><p class="my_name_text">${data.nickname}</p></div>
            <div class="my_job"><p class="my_job_text">${data.title}</p></div>
            <div class="contact_case">
                <div class="contact"><p class="contact_text_text">${data.phone}</p></div>
                <div class="contact"><p class="contact_text_text">${data.email}</p></div>
                <div class="contact"><p class="contact_text_text">${data.website}</p></div>
            </div>
        `;

        friendsWrapEl.appendChild(card);
    }
}

// ================= 로그인 감지 =================
onAuthStateChanged(auth, (user) => {
    if (!user) return;

    loadProfile(user.uid);
    loadFriends(user.uid);
});
