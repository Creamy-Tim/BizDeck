// ======================
// 0. Firebase SDK 모듈 가져오기 (CDN 버전)
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
function getUidFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const uidFromUid = params.get("uid");
  const uidFromId  = params.get("id");   // QR에서 사용하는 파라미터

  const uid = (uidFromUid && uidFromUid.trim() !== "")
    ? uidFromUid.trim()
    : (uidFromId && uidFromId.trim() !== "")
      ? uidFromId.trim()
      : null;

  if (uid) {
    console.log("[card] URL에서 uid 감지:", uid);
    return uid;
  } else {
    console.log("[card] uid/id 파라미터 없음");
    return null;
  }
}

// ======================
// 4. Firestore에서 프로필 불러오기
// ======================
async function loadProfileByUid(uid) {
  if (!uid) {
    console.log("[card] uid 없음 → 로드 중단");
    return;
  }

  console.log("[card] Firestore 로드 시도, uid =", uid);

  try {
    // 컬렉션 이름: users (스크린샷과 동일)
    const ref  = doc(db, "users", uid);
    const snap = await getDoc(ref);

    console.log("[card] snap.exists? =", snap.exists());

    if (!snap.exists()) {
      console.log("[card] 해당 uid 문서가 없습니다:", uid);
      return;
    }

    const data = snap.data();
    console.log("[card] 불러온 데이터:", data);

    // 🔹 Firestore 필드명에 1:1로 맞춤
    const displayName  = data.nickname || "";
    const displayJob   = data.title    || "";
    const displayPhone = data.phone    || "";
    const displayEmail = data.email    || "";
    const displaySite  = data.website  || "";

    if (nameEl) nameEl.textContent = displayName || "이름 정보 없음";
    if (jobEl)  jobEl.textContent  = displayJob  || "소속/직함 정보 없음";

    if (contactEls[0]) contactEls[0].textContent = displayPhone || "전화번호 없음";
    if (contactEls[1]) contactEls[1].textContent = displayEmail || "이메일 없음";
    if (contactEls[2]) contactEls[2].textContent = displaySite  || "웹사이트 없음";

  } catch (err) {
    console.error("[card] 프로필 로드 오류:", err.code, err.message);
  }
}

// ======================
// 5. 초기 실행
// ======================
const urlUid = getUidFromUrl();
if (urlUid) {
  loadProfileByUid(urlUid);
} else {
  console.log("[card] URL에 uid/id가 없어서 아무 것도 로드하지 않음");
}

// ======================
// 6. 친구 추가 기능
// ======================

async function addFriend(friendUid) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("로그인 후 친구 추가가 가능합니다.");
    return;
  }

  const userRef = doc(db, "users", currentUser.uid);

  try {
    // 현재 사용자의 데이터를 가져옵니다
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentFriends = userData?.friends || [];

    // 이미 친구가 아닌 경우, 친구 목록에 추가합니다
    if (!currentFriends.includes(friendUid)) {
      currentFriends.push(friendUid);
      await setDoc(userRef, { friends: currentFriends }, { merge: true });
      alert("친구가 추가되었습니다!");
    } else {
      alert("이미 친구 목록에 추가된 사용자입니다.");
    }
  } catch (err) {
    console.error("친구 추가 실패:", err);
  }
}

// ======================
// 7. 버튼 클릭 시 친구 추가
// ======================
document.getElementById("btnSaveToApp").addEventListener("click", () => {
  const friendUid = getUidFromUrl(); // QR 코드에서 `uid` 추출
  if (friendUid) {
    addFriend(friendUid); // 친구 추가 함수 호출
  } else {
    alert("친구 정보를 불러올 수 없습니다.");
  }
});