// Firebase 초기화
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 명함 추가 함수
function createCard({ nickname, title, phone, email, website }) {
    const card = document.createElement('div');
    card.classList.add('my_card');
    card.classList.add('my-card-instance');

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
    
    // 명함을 cards-container에 추가
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.appendChild(card);
}

// 🔹 여러 명함 불러오기 함수
async function loadProfiles() {
    const usersRef = firebase.firestore().collection("users"); // 여러 명을 조회
    try {
    const querySnapshot = await usersRef.get();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        createCard(data); // Firestore 데이터로 명함 생성
    });
    } catch (err) {
    console.error("명함 불러오기 실패:", err.message);
    alert("명함 불러오기 실패");
    }
}

// 🔹 명함 저장하기 함수
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
    alert("로그인 후 수정 가능합니다.");
    return;
    }

    const name = document.getElementById("nameEl").value;
    const title = document.getElementById("titleEl").value;
    const contact = document.getElementById("contactEl").value;
    const email = document.getElementById("emailEl").value;
    const website = document.getElementById("websiteEl").value;

    const ref = db.collection("users").doc(user.uid);

    console.log("Firestore에 저장할 데이터:", { name, title, contact, email, website });

    try {
    console.log("Firestore에 데이터 저장 중...");
    await ref.set(
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

    // 저장 후 명함을 다시 불러옴
    loadProfiles();
    } catch (err) {
    console.error("Firestore에 저장 실패:", err.message);
    }
}

// 페이지가 로드될 때 기존 명함을 불러옴
window.onload = function() {
    loadProfiles();
}