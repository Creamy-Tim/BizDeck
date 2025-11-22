// qr-profile.js
// 로그인 / 회원가입 공용 스크립트

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ==========================
// 1. Firebase 초기화
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyChGzlnFvC5vFhqxqDyP-ZNFirvSxzI0Z0",
  authDomain: "bizdeck-9fae5.firebaseapp.com",
  projectId: "bizdeck-9fae5",
  storageBucket: "bizdeck-9fae5.firebasestorage.app",
  messagingSenderId: "947125248466",
  appId: "1:947125248466:web:255f15e2555a7e43a5a80b",
  measurementId: "G-RQ7KHXBP6J",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================
// 2. 공용 DOM 요소
// ==========================
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.getElementById("status");

// 상태 메시지 출력
function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
  console.log(message);
}

// ==========================
// 3. 회원가입  (⭐ A 방법 반영)
// ==========================
async function handleSignUp() {
  // 버튼 눌릴 때마다 DOM에서 다시 읽기 (null 방지)
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  if (!emailInput || !passInput) {
    setStatus("입력 필드를 찾지 못했습니다. HTML의 id(email, password)를 확인해 주세요.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    setStatus("이메일과 비밀번호를 모두 입력해 주세요.");
    return;
  }

  try {
    // 1) Firebase Auth에 계정 생성
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2) Firestore에 이 유저의 "명함 기본 구조"까지 한 번에 만들어두기
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,          // 로그인용 이메일
        nickname: "",               // 명함 이름(처음엔 비워둠)
        title: "",                  // 직함
        phone: "",                  // 연락처
        website: "",                // 웹사이트
        createdAt: new Date().toISOString(),
      },
      { merge: true }              // 나중에 명함 저장할 때 같은 문서에 덮어쓰기
    );

    setStatus("✅ 회원가입 완료! " + user.email);
    // 명함 페이지로 이동
    window.location.href = "card.html";
  } catch (err) {
    setStatus("❌ 회원가입 실패: " + err.message);
  }
}

// ==========================
// 4. 로그인
// ==========================
async function handleLogIn() {
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  if (!emailInput || !passInput) {
    setStatus("입력 필드를 찾지 못했습니다. HTML의 id(email, password)를 확인해 주세요.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    setStatus("이메일과 비밀번호를 모두 입력해 주세요.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    setStatus("✅ 로그인 성공: " + user.email);
    window.location.href = "card.html";
  } catch (err) {
    setStatus("❌ 로그인 실패: " + err.message);
  }
}

// ==========================
// 5. 로그아웃
// ==========================
async function handleLogOut() {
  try {
    await signOut(auth);
    setStatus("🔓 로그아웃 완료");
    // 필요하면 여기서 로그인 페이지로 리다이렉트
    // window.location.href = "login.html";
  } catch (err) {
    setStatus("❌ 로그아웃 실패: " + err.message);
  }
}

// ==========================
// 6. 로그인 상태 감지 (선택)
// ==========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("현재 로그인됨:", user.email);
    if (statusEl) {
      statusEl.textContent = `🔐 로그인 상태: ${user.email}`;
    }
  } else {
    console.log("로그인된 사용자 없음");
    if (statusEl) {
      statusEl.textContent = "🔓 로그인한 사용자가 없습니다.";
    }
  }
});

// ==========================
// 7. 버튼 이벤트 연결
// ==========================
// 페이지마다 버튼이 없을 수도 있으니 null 체크
if (signupBtn) signupBtn.addEventListener("click", handleSignUp);
if (loginBtn) loginBtn.addEventListener("click", handleLogIn);
if (logoutBtn) logoutBtn.addEventListener("click", handleLogOut);
