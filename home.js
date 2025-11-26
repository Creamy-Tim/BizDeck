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

// 🔹 프로필 불러오기
async function loadProfile(uid) {
  const ref = doc(db, "users", uid);

  try {
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      console.log("Firestore에 이 사용자의 문서가 없음. 기본 명함 유지");
      return; // 아무것도 안 바꿈 → 기본 값 그대로
    }

    const userData = docSnap.data();  // Firestore에서 가져온 사용자 데이터
    console.log("불러온 데이터:", userData);

    const { nickname, title, phone, email, website, isItalic, isBold, isUnderline, isUppercase, fontSize, card_color } = userData;

    // 텍스트에 스타일 적용 (예: .text_item 클래스를 가진 요소들)
    document.querySelectorAll('.text_item').forEach(textElement => {
      if (isItalic) textElement.style.fontStyle = 'italic';
      else textElement.style.fontStyle = 'normal';

      if (isBold) textElement.style.fontWeight = 'bold';
      else textElement.style.fontWeight = 'normal';

      if (isUnderline) textElement.style.textDecoration = 'underline';
      else textElement.style.textDecoration = 'none';

      if (isUppercase) textElement.style.textTransform = 'uppercase';
      else textElement.style.textTransform = 'none';
    });

    const data = docSnap.data();
    const font_size = data.fontSize || 0; // 저장된 폰트 크기 값 가져오기 (기본값: 0)

    console.log("불러온 폰트 크기:", font_size);

    // 폰트 크기 적용 함수
    applyFontSize(font_size);

    // 폰트 크기 적용
    function applyFontSize(font_size) {
      // 텍스트 요소를 선택
      const textElements = document.querySelectorAll('.text_item');

      // 각 텍스트 요소에 폰트 크기 적용
      textElements.forEach(textElement => {
        // 기존 폰트 크기를 가져오고, 폰트 크기를 계산하여 덧붙이기
        const currentFontSize = window.getComputedStyle(textElement).fontSize;
        const currentFontSizeValue = parseInt(currentFontSize); // 기존 폰트 크기 (px 단위)

        // 폰트 크기 계산 (기존 값에 가져온 font_size를 더함)
        const newFontSize = currentFontSizeValue + fontSize;

        // 폰트 크기 업데이트
        textElement.style.fontSize = `${newFontSize}px`;
      });
    }

    // 프로필 로드 (색상 값 포함)
    const card_background_color = data.card_color || "#FE5858";  // 저장된 색상 값 가져오기 (기본값: 분홍색)

    console.log("불러온 색상 값:", card_background_color);

    // 색상 값을 적용할 텍스트 요소 선택
    document.querySelectorAll('.my_card').forEach(textElement => {
      textElement.style.background = card_background_color;  // 저장된 색상 값 적용
    });


    // 이메일 말고 다른 값이 하나라도 있는지 체크
    const hasOtherFields =
      (nickname && nickname.trim() !== "") ||
      (title && title.trim() !== "") ||
      (phone && phone.trim() !== "") ||
      (website && website.trim() !== "");

    if (!hasOtherFields) {
      console.log("이메일만 있어서 기본 명함 유지");
      // 필요하면 이메일만 교체하고 싶으면 여기에서:
      if (email) emailEl.textContent = email;
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

  } catch (err) {
    console.error("Firestore에 저장 실패:", err.message);

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
const saveBtn = document.getElementById("save_button");

if (saveBtn) {
  saveBtn.addEventListener("click", saveProfile);
}
