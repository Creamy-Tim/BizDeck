// Firebase SDK 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase 설정 (새로 만든 config)
const firebaseConfig = {
  apiKey: "AIzaSyChGzlnFvC5vFhqxqDyP-ZNFirvSxzI0Z0",
  authDomain: "bizdeck-9fae5.firebaseapp.com",
  projectId: "bizdeck-9fae5",
  storageBucket: "bizdeck-9fae5.firebasestorage.app",
  messagingSenderId: "947125248466",
  appId: "1:947125248466:web:255f15e2555a7e43a5a80b",
  measurementId: "G-RQ7KHXBP6J"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👉 기본 명함 값 (HTML에도 이미 들어가 있지만, 참고용으로 보관)
const DEFAULT_CARD = {
  name: "Name",
  title: "Job",
  contact: "010-0000-0000",
  email: "Email",
  website: "Website",
};

// DOM 요소
const nameEl = document.querySelector(".my_name_text");
const titleEl = document.querySelector(".my_job_text");

const contactTextNodes = document.querySelectorAll(".contact_text_text");
const contactEl = contactTextNodes[0];  // 전화
const emailEl   = contactTextNodes[1];  // 이메일
const websiteEl = contactTextNodes[2];  // 웹사이트

// 친구들의 명함을 동적으로 생성하는 함수
async function loadFriendsProfile(userUid) {
    try {
        // 1. 현재 로그인된 유저의 친구 목록 가져오기
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("사용자 데이터가 없습니다.");
            return;
        }

        const userData = userSnap.data();
        const friendUids = userData.friend || [];  // 친구들의 UID 배열

        console.log("친구들의 UID 배열:", friendUids);

        // 2. 친구들의 데이터를 가져와서 명함 생성
        const cardsContainer = document.getElementById('my_card');
        cardsContainer.innerHTML = "";  // 기존 명함을 지우고 새로 로드

        for (const friendUid of friendUids) {
            const friendRef = doc(db, "users", friendUid);
            const friendSnap = await getDoc(friendRef);

            if (friendSnap.exists()) {
                const friendData = friendSnap.data();
                createCard(friendData);
            } else {
                console.log(`친구 데이터가 없음: ${friendUid}`);
            }
        }
    } catch (err) {
        console.error("친구 명함 불러오기 실패:", err.message);
        alert("친구 명함 불러오기 실패");
    }
}

// 명함을 동적으로 생성하는 함수
function createCard({ nickname, title, phone, email, website }) {
    const card = document.createElement('div');
    card.classList.add('my_card');
    card.innerHTML = `
        <div class="my_name">
            <p class="my_name_text">${nickname || 'Name'}</p>
        </div>
        <div class="my_job">
            <p class="my_job_text">${title || 'Job'}</p>
        </div>
        <div class="contact_case">
            <div class="contact">
                <p class="contact_text_text">${phone || '010-0000-0000'}</p>
            </div>
            <div class="contact">
                <p class="contact_text_text">${email || 'Email'}</p>
            </div>
            <div class="contact">
                <p class="contact_text_text">${website || 'Website'}</p>
            </div>
        </div>
        <div class="logo">
            <img src="./assets/img/BizDeck_logo.svg" class="logo_img">
        </div>
    `;
    // 생성된 명함을 my_card에 추가
    const cardsContainer = document.getElementById('my_card');
    cardsContainer.appendChild(card);
}

// 로그인 상태 감지 후 친구 명함 로드
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("로그인된 유저:", user.email);
        // 로그인된 유저의 UID를 가져와서 친구 명함을 로드
        loadFriendsProfile(user.uid);
    } else {
        console.log("로그인되지 않았습니다.");
        alert("로그인 후 명함을 확인할 수 있습니다.");
    }
});