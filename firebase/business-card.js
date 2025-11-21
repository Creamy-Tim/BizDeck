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
  name: "홍길동",
  title: "제품 디자이너",
  contact: "010-0000-0000",
  email: "bcd@yonsei.ac.kr",
  website: "www.abc.com",
};

// DOM 요소
const nameEl = document.querySelector(".name");
const titleEl = document.querySelector(".title");
const contactEl = document.querySelector(".contact");
const emailEl = document.querySelector(".email");
const websiteEl = document.querySelector(".website");

// 🔹 프로필 불러오기
async function loadProfile(uid) {
  const ref = doc(db, "users", uid);

  try {
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      console.log("Firestore에 이 사용자의 문서가 없음. 기본 명함 유지");
      return; // 아무것도 안 바꿈 → 기본 값 그대로
    }

    const data = docSnap.data();
    console.log("불러온 데이터:", data);

    const { nickname, title, phone, email, website } = data;

    // 이메일 말고 다른 값이 하나라도 있는지 체크
    const hasOtherFields =
      (nickname && nickname.trim() !== "") ||
      (title && title.trim() !== "") ||
      (phone && phone.trim() !== "") ||
      (website && website.trim() !== "");

    if (!hasOtherFields) {
      console.log("이메일만 있어서 기본 명함 유지");
      // 필요하면 이메일만 교체하고 싶으면 여기에서:
      // if (email) emailEl.textContent = email;
      return;
    }

    // 🔸 여기까지 왔다면: 명함 정보가 어느 정도 채워져 있는 상태 → 화면에 반영
    nameEl.textContent = nickname || DEFAULT_CARD.name;
    titleEl.textContent = title || DEFAULT_CARD.title;
    contactEl.textContent = phone || DEFAULT_CARD.contact;
    emailEl.textContent = email || DEFAULT_CARD.email;
    websiteEl.textContent = website || DEFAULT_CARD.website;

  } catch (err) {
    console.error("명함 불러오기 실패:", err.message);
    alert("명함 불러오기 실패");
  }
}

// 🔹 명함 저장하기
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인 후 수정 가능합니다.");
    return;
  }

  const name = nameEl.textContent;
  const title = titleEl.textContent;
  const contact = contactEl.textContent;
  const email = emailEl.textContent;
  const website = websiteEl.textContent;

  const ref = doc(db, "users", user.uid);

  console.log("Firestore에 저장할 데이터:", { name, title, contact, email, website });

  try {
    console.log("Firestore에 데이터 저장 중...");
    await setDoc(
      ref,
      {
        nickname: name,
        title: title,
        phone: contact,
        email: email,
        website: website,
      },
      { merge: true }
    );

    console.log("명함이 저장되었습니다.");
    alert("명함이 저장되었습니다.");
  } catch (err) {
    console.error("Firestore에 저장 실패:", err.message);
    alert("명함 저장 실패");
  }
}

// 로그인 상태 바뀔 때 명함 자동 로드
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("명함 페이지 - 로그인 감지:", user.email);
    loadProfile(user.uid);
  } else {
    console.log("명함 페이지 - 로그인 안 됨, 기본 명함 사용");
  }
});

// 저장 버튼 클릭 시
document.getElementById("saveBtn").addEventListener("click", saveProfile);
