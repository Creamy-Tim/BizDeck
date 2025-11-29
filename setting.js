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

// 로그인된 사용자 감지 및 처리
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("로그인된 사용자:", user.email);
        // 로그인된 사용자의 UID를 세션에 저장하거나 이후의 작업에 사용
    } else {
        console.log("로그인되지 않은 사용자");
    }
});

// Firebase Firestore에 텍스트 저장하기
document.getElementById('saveButton').addEventListener('click', async () => {
    // 입력값 가져오기
    const name = document.getElementById('my_name').value;
    const job = document.getElementById('my_job').value;
    const phone = document.getElementById('phone_number').value;
    const email = document.getElementById('email').value;
    const website = document.getElementById('website').value;

    // 스타일 정보 (예시: 굵기, 기울기, 밑줄)
    const isUppercase = document.querySelector('.style_button[data_style="uppercase"]').classList.contains('style_box_choice');
    const isBold = document.querySelector('.style_button[data_style="bold"]').classList.contains('style_box_choice');
    const isItalic = document.querySelector('.style_button[data_style="italic"]').classList.contains('style_box_choice');
    const isUnderline = document.querySelector('.style_button[data_style="underline"]').classList.contains('style_box_choice');

    // 폰트 크기 정보
    const fontSize = getFontSizeFromActiveButton();

    // 명함 배경 색 정보
    const card_color = getCardSizeFromActiveButton();

    // 필수 항목 체크
    if (name.trim() === "") {
        alert("이름을 입력해주세요.");
        return;
    } else if (job.trim() === "") {
        alert("직업을 입력해주세요.");
        return;
    } else if (phone.trim() === "") {
        alert("전화번호를 입력해주세요.");
        return;
    } else if (email.trim() === "") {
        alert("이메일을 입력해주세요.");
    }

    // 버튼 중복 클릭 방지
    const btn = document.getElementById('saveButton');
    btn.disabled = true;

    try {
        await setDoc(doc(db,"users", user.uid), { /* 데이터 */ });
        alert("저장 완료!");
        window.location.href = 'home.html';
    } catch (e) {
        console.error("저장 실패", e);
        alert("저장 실패");
        btn.disabled = false;  // 실패 시 다시 활성화
    }

    // 현재 로그인된 사용자의 UID 가져오기
    const user = auth.currentUser;

    if (!user) {
        alert("로그인 후 프로필을 수정할 수 있습니다.");
        return;
    }

    const userUid = user.uid; // 로그인된 사용자의 UID

    // Firestore에 데이터 저장하기
    try {
        // 데이터를 저장할 문서 참조 (각 사용자 문서는 UID로 저장)
        const docRef = doc(db, "users", userUid); // "users" 컬렉션에 사용자의 UID를 문서 ID로 사용

        // 사용자 데이터 저장
        await setDoc(docRef, {
            nickname: name,
            title: job,
            phone: phone,
            email: email,
            website: website,
            timestamp: new Date(), // 저장 시각

            isUppercase: isUppercase,
            isBold: isBold,
            isItalic: isItalic,
            isUnderline: isUnderline,

            fontSize: fontSize,

            card_color: card_color
        });

        console.log("변경사항이 성공적으로 저장되었습니다.");

        // 입력 필드 초기화
        document.getElementById('my_name').value = "";
        document.getElementById('my_job').value = "";
        document.getElementById('phone_number').value = "";
        document.getElementById('email').value = "";
        document.getElementById('website').value = "";

    } catch (error) {
        console.error("변경사항 저장 실패:", error);
        alert("변경사항 저장 실패");
    }
});



document.getElementById('saveButton').addEventListener('click', async () => {
    // 입력값 가져오기
    const name = document.getElementById('my_name').value;
    const job = document.getElementById('my_job').value;
    const phone = document.getElementById('phone_number').value;
    const email = document.getElementById('email').value;
    const website = document.getElementById('website').value;

    // 스타일 정보 (예시: 굵기, 기울기, 밑줄)
    const isUppercase = document.querySelector('.style_button[data_style="uppercase"]').classList.contains('style_box_choice');
    const isBold = document.querySelector('.style_button[data_style="bold"]').classList.contains('style_box_choice');
    const isItalic = document.querySelector('.style_button[data_style="italic"]').classList.contains('style_box_choice');
    const isUnderline = document.querySelector('.style_button[data_style="underline"]').classList.contains('style_box_choice');

    // 폰트 크기 정보
    const fontSize = getFontSizeFromActiveButton();

    // 명함 배경 색 정보
    const card_color = getCardSizeFromActiveButton();

    if (!name.trim())  { alert("이름을 입력해주세요."); return; }
    if (!job.trim())   { alert("직업을 입력해주세요."); return; }
    if (!phone.trim()) { alert("전화번호를 입력해주세요."); return; }
    if (!email.trim()) { alert("이메일을 입력해주세요."); return; }

    const user = auth.currentUser;
    if (!user) {
        alert("로그인 후 프로필을 수정할 수 있습니다.");
        return;
    }

    const btn = document.getElementById('saveButton');
    btn.disabled = true;  // 중복 클릭 방지

    try {
        await setDoc(doc(db, "users", user.uid), {
            nickname: name,
            title: job,
            phone: phone,
            email: email,
            website: website,
            timestamp: new Date(), // 저장 시각

            isUppercase: isUppercase,
            isBold: isBold,
            isItalic: isItalic,
            isUnderline: isUnderline,

            fontSize: fontSize,

            card_color: card_color
        });

        console.log("변경사항이 성공적으로 저장되었습니다.");
        window.location.href = 'home.html';
    } catch(error) {
        console.error("저장 실패:", error);
        alert("저장 중 오류가 발생했습니다.");
        btn.disabled = false;
    }
});











// 스타일링



// 모든 스타일 버튼을 선택
const buttons = document.querySelectorAll('.style_button');

// 모든 텍스트 요소들을 선택
const textElements = document.querySelectorAll('.text_item');

// 버튼 클릭 시 해당 스타일을 토글하는 이벤트 리스너
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const style = button.getAttribute('data_style'); // 클릭한 버튼의 data_style 값을 가져옴

        // 각 텍스트 요소에 스타일을 토글
        textElements.forEach(textElement => {
            textElement.classList.toggle(style);
            button.classList.toggle('style_box_choice');
        });
    });
});


// 폰트 사이즈 버튼 선택
const size_button = document.querySelectorAll('.size_button');

// 버튼 클릭 시 해당 버튼에 'active' 클래스 토글
size_button.forEach(button => {
    button.addEventListener('click', () => {
        // 클릭된 버튼에 active 클래스를 추가
        size_button.forEach(btn => btn.classList.remove('active'));  // 모든 버튼에서 'active' 제거
        button.classList.add('active');  // 클릭된 버튼에 'active' 추가

        // 여기에 원하는 스타일을 적용할 수 있습니다.
        // 예를 들어, 스타일 변경을 위한 클래스 토글 코드 작성
    });
});


// 폰트 사이즈 선택 함수
function getFontSizeFromActiveButton() {
  const activeButton = document.querySelector('.size_button.active');  // 'active' 클래스를 가진 버튼 찾기
  if (activeButton) {
   return parseInt(activeButton.getAttribute('data_style'));  // active 버튼의 data_style 속성값 가져오기
  }
  return null;  // 아무 버튼도 선택되지 않으면 null 반환
}



// 명함 배경색 버튼 선택
const colorButtons = document.querySelectorAll('.palette_color');

// 버튼 클릭 시 해당 버튼에 'active' 클래스 토글
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 클릭된 버튼에 active 클래스를 추가
        colorButtons.forEach(btn => btn.classList.remove('active'));  // 모든 버튼에서 'active' 제거
        button.classList.add('active');  // 클릭된 버튼에 'active' 추가

        // 여기에 원하는 스타일을 적용할 수 있습니다.
        // 예를 들어, 스타일 변경을 위한 클래스 토글 코드 작성
    });
});


// 명함 배경색 선택 함수
function getCardSizeFromActiveButton() {
  const activeButton = document.querySelector('.palette_color.active');  // 'active' 클래스를 가진 버튼 찾기
  if (activeButton) {
   return activeButton.getAttribute('data_color');  // active 버튼의 data_color 속성값 가져오기
  }
  return null;  // 아무 버튼도 선택되지 않으면 null 반환
}