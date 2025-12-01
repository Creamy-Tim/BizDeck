// ======================
// 0. Firebase SDK 모듈 가져오기 (CDN 버전)
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ======================
// 1. Firebase 초기화
// ======================
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

console.log("[card] Firebase 초기화 완료");

// ======================
// 2. DOM 요소
// ======================
const nameEl     = document.querySelector(".my_name_text");
const jobEl      = document.querySelector(".my_job_text");
const contactEls = document.querySelectorAll(".contact_text_text");
// [0] phone, [1] email, [2] website

console.log("[card] DOM:",
  "nameEl =", !!nameEl,
  "jobEl =", !!jobEl,
  "contactEls.length =", contactEls.length
);

// ======================
// 3. URL에서 uid(id) 읽기
// ======================
// URL에서 카드 주인의 UID 가져오기 (?id=... 혹은 ?uid=...)
function getUidFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const uidFromUid = params.get("uid");
  const uidFromId  = params.get("id");

  const uid = (uidFromUid && uidFromUid.trim() !== "")
    ? uidFromUid.trim()
    : (uidFromId && uidFromId.trim() !== "")
      ? uidFromId.trim()
      : null;

  return uid;
}

// ======================
// 4. Firestore에서 프로필 불러오기
// ======================
const cardOwnerUid = getUidFromUrl();   // ✅ 카드 주인 UID (A)

if (!cardOwnerUid) {
  console.error("URL에서 uid/id를 찾을 수 없습니다.");
  // 여기서는 에러 문구만 띄우고 끝내도 됨
}

// 카드(명함) 정보 불러오기
async function loadCard(ownerUid) {
  try {
    const cardRef = doc(db, "users", ownerUid);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) {
      console.error("해당 UID의 명함 데이터를 찾을 수 없습니다.");
      return;
    }

    const data = cardSnap.data();

    const displayName  = data.nickname || data.name || "";
    const displayJob   = data.title    || "";
    const displayPhone = data.phone    || "";
    const displayEmail = data.email    || "";
    const displaySite  = data.website  || "";
    const card_background_color = data.card_color || "#FE5858";

    if (nameEl) nameEl.textContent = displayName || "이름 정보 없음";
    if (jobEl)  jobEl.textContent  = displayJob  || "소속/직함 정보 없음";

    if (contactEls[0]) contactEls[0].textContent = displayPhone || "전화번호 없음";
    if (contactEls[1]) contactEls[1].textContent = displayEmail || "이메일 없음";
    if (contactEls[2]) contactEls[2].textContent = displaySite  || "웹사이트 없음";

    // 🔵 여기로 이동
    document.querySelectorAll('.my_card').forEach(cardEl => {
      cardEl.style.background = card_background_color;
    });

  } catch (err) {
    console.error("카드 정보 로드 실패:", err);
  }
}


// 페이지 로드 시, 카드 주인 기준으로 명함 보여주기
if (cardOwnerUid) {
  loadCard(cardOwnerUid);
}

// ======================
// 5. 친구 추가 기능
// ======================

async function addFriend(friendUid) {
  const currentUser = auth.currentUser; // ✅ B

  if (!currentUser) {
    alert("로그인 후 친구 추가가 가능합니다.");
    return;
  }

  if (!friendUid) {
    alert("친구 UID를 찾을 수 없습니다.");
    return;
  }

  const viewerRef = doc(db, "users", currentUser.uid);  // ✅ B 문서

  try {
    await setDoc(
      viewerRef,
      {
        friends: arrayUnion(friendUid),  // ✅ A를 B의 friends에 추가
      },
      { merge: true }
    );
    alert("친구로 등록되었습니다!");
  } catch (err) {
    console.error("친구 추가 실패:", err);
    alert("친구 추가 실패: " + err.message);
  }
}


// ======================
// 6. 버튼 클릭 시 친구 추가
// ======================

// 버튼 클릭 시: 항상 “이 카드의 주인(cardOwnerUid)”를 친구로 추가
const saveBtn = document.getElementById("btnSaveToApp");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (!cardOwnerUid) {
      alert("친구 정보를 불러올 수 없습니다.");
      return;
    }
    addFriend(cardOwnerUid);
  });
}
