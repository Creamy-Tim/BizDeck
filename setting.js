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
        return;
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
            isUnderline: isUnderline
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