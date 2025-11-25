// ======================
// 0. Firebase SDK 모듈 가져오기
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ======================
// 1. Firebase 초기화
//    (⚠️ 반드시 콘솔에서 복붙한 값과 동일해야 함)
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyChGzlnFvC5D0K8EEMu1e8p5FG3FoJKa8",            // 실제 값
  authDomain: "bizdeck-9fae5.firebaseapp.com",
  projectId: "bizdeck-9fae5",
  storageBucket: "bizdeck-9fae5.appspot.com",                   // 보통 *.appspot.com 형식
  messagingSenderId: "947125248466",
  appId: "1:947125248466:web:15f0c0a2f4b0c3d7d2b5d1",
  measurementId: "G-RQH9ZC2XYZ"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

console.log("[Firebase] 초기화 완료");


// ======================
// 2. DOM 요소 잡기
// ======================
const nameEl      = document.querySelector(".my_name_text");
const jobEl       = document.querySelector(".my_job_text");
const contactEls  = document.querySelectorAll(".contact_text_text");
// contactEls[0] = phone, contactEls[1] = email, contactEls[2] = website (card.html 기준)

console.log("[DOM] nameEl:", !!nameEl, "| jobEl:", !!jobEl, "| contactEls length:", contactEls.length);


// ======================
// 3. URL 에서 UID 꺼내기
// ======================
function getUidFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    if (uid && uid.trim() !== "") {
      console.log("[URL] uid 감지:", uid);
      return uid.trim();
    }
    console.log("[URL] uid 파라미터 없음");
    return null;
  } catch (e) {
    console.error("[URL] uid 파싱 실패:", e);
    return null;
  }
}


// ======================
// 4. Firestore 에서 명함 불러오기
// ======================
async function loadProfileByUid(uid) {
  if (!uid) {
    console.log("[loadProfileByUid] uid 없음 → 중단");
    return;
  }

  console.log("[loadProfileByUid] 호출, uid =", uid);

  try {
    const ref  = doc(db, "users", uid);   // ⚠️ 컬렉션 이름 다르면 여기 수정
    const snap = await getDoc(ref);

    console.log("[loadProfileByUid] snap.exists? =", snap.exists());

    if (!snap.exists()) {
      console.log("[loadProfileByUid] 해당 UID 문서가 없습니다:", uid);
      return;
    }

    const data = snap.data();
    console.log("[loadProfileByUid] 불러온 문서 데이터:", data);

    // 🔹 필드명 여러 패턴 커버 (name / nickname / userName 등)
    const displayName   = data.name    || data.nickname || data.userName || "";
    const displayJob    = data.job     || data.title    || data.major    || "";
    const displayPhone  = data.phone   || data.tel      || data.contact  || "";
    const displayEmail  = data.email   || data.mail     || "";
    const displaySite   = data.website || data.link     || data.url      || "";

    if (nameEl) nameEl.textContent = displayName || "이름 정보 없음";
    if (jobEl)  jobEl.textContent  = displayJob  || "직무/소속 정보 없음";

    if (contactEls.length > 0) contactEls[0].textContent = displayPhone || "연락처 정보 없음";
    if (contactEls.length > 1) contactEls[1].textContent = displayEmail || "이메일 정보 없음";
    if (contactEls.length > 2) contactEls[2].textContent = displaySite  || "웹사이트 정보 없음";

  } catch (err) {
    console.error("[loadProfileByUid] 프로필 로드 중 오류:", err.code, err.message);
  }
}


// ======================
// 5. 명함 저장 (로그인한 본인용 – 필요할 때만 사용)
// ======================
async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인 후에만 저장할 수 있습니다.");
    console.warn("[saveProfile] currentUser 없음");
    return;
  }

  const uid = user.uid;
  console.log("[saveProfile] 저장 시도, uid =", uid);

  const payload = {
    name:    nameEl      ? nameEl.textContent.trim()         : "",
    job:     jobEl       ? jobEl.textContent.trim()          : "",
    phone:   contactEls[0] ? contactEls[0].textContent.trim() : "",
    email:   contactEls[1] ? contactEls[1].textContent.trim() : "",
    website: contactEls[2] ? contactEls[2].textContent.trim() : "",
  };

  console.log("[saveProfile] payload =", payload);

  try {
    await setDoc(doc(db, "users", uid), payload, { merge: true });
    alert("명함 정보가 저장되었습니다.");
    console.log("[saveProfile] 저장 성공");
  } catch (err) {
    console.error("[saveProfile] 프로필 저장 오류:", err.code, err.message);
    alert("저장 중 오류가 발생했습니다. (콘솔 확인)");
  }
}


// ======================
// 6. 초기 로딩 로직
// ======================

const urlUid = getUidFromUrl();

if (urlUid) {
  // ✅ QR로 들어온 경우: URL 에 ?uid=... 가 있으면 그걸 기준으로 로드
  window.currentUid = urlUid;   // (QR 재생성 시에도 사용 가능)
  loadProfileByUid(urlUid);
} else {
  // ✅ URL에 uid가 없으면 → 로그인 된 사람 기준으로 로드
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("[Auth] 로그인 감지, uid =", user.uid);
      window.currentUid = user.uid;
      loadProfileByUid(user.uid);
    } else {
      console.log("[Auth] 로그인 안 되어 있고, URL에도 uid 없음 → 기본값 그대로 표시");
    }
  });
}


// ======================
// 7. 저장 버튼 이벤트 (있을 때만)
// ======================
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  console.log("[DOM] saveBtn 감지 → 클릭 이벤트 바인딩");
  saveBtn.addEventListener("click", saveProfile);
} else {
  console.log("[DOM] saveBtn 없음 (보기 전용 페이지일 수 있음)");
}
