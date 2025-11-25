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

// 👉 기본 명함 값
const DEFAULT_CARD = {
  name: "홍길동",
  title: "제품 디자이너",
  contact: "010-0000-0000",
  email: "bcd@yonsei.ac.kr",
  website: "www.abc.com",
};

// DOM 요소
const nameEl = document.querySelector(".my_name_text");
const titleEl = document.querySelector(".my_job_text");

const contactTextNodes = document.querySelectorAll(".contact_text_text");
const contactEl = contactTextNodes[0];  // 전화
const emailEl   = contactTextNodes[1];  // 이메일
const websiteEl = contactTextNodes[2];  // 웹사이트

// 🔍 URL에서 uid 읽어오기 (?uid=XXXX 형식 가정)
function getUidFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  return uid && uid.trim() !== "" ? uid.trim() : null;
}

// 🔹 프로필 불러오기 (파라미터로 uid를 받도록 유지)
async function loadProfile(uid) {
  if (!uid) {
    console.log("loadProfile: uid가 없습니다.");
    return;
  }

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
      // 필요하면 이메일만 바꾸고 싶으면 여기에서:
      // if (email) emailEl.textContent = email;
      return;
    }

    // 🔸 여기까지 왔다면: 명함 정보가 어느 정도 채워져 있는 상태 → 화면에 반영
    nameEl.textContent    = nickname || DEFAULT_CARD.name;
    titleEl.textContent   = title    || DEFAULT_CARD.title;
    contactEl.textContent = phone    || DEFAULT_CARD.contact;
    emailEl.textContent   = email    || DEFAULT_CARD.email;
    websiteEl.textContent = website  || DEFAULT_CARD.website;

  } catch (err) {
    console.error("명함 불러오기 실패:", err.message);
    alert("명함 불러오기 실패");
  }
}

// 🔹 명함 저장하기 (로그인된 본인이 수정할 때용)
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인 후 수정 가능합니다.");
    return;
  }

  const name    = nameEl.textContent;
  const title   = titleEl.textContent;
  const contact = contactEl.textContent;
  const email   = emailEl.textContent;
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

// ✅ 진입 시 로직
const uidFromUrl = getUidFromUrl();

// 1) QR로 들어와서 ?uid=...가 있는 경우 → 로그인 여부 상관 없이 해당 uid의 명함 보여주기
if (uidFromUrl) {
  console.log("URL에서 uid 감지:", uidFromUrl);
  loadProfile(uidFromUrl);
} else {
  // 2) URL에 uid가 없으면 → 로그인된 사용자 기준으로 명함 로드
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("명함 페이지 - 로그인 감지:", user.email);
      loadProfile(user.uid);
    } else {
      console.log("명함 페이지 - 로그인 안 됨, 기본 명함 사용");
    }
  });
}

// 저장 버튼 클릭 시 (버튼이 있는 페이지에서만 동작하도록 방어 코드)
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", saveProfile);
}
