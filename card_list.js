// Firebase 초기화
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Firebase 초기화 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 친구 명함 불러오기 함수
async function loadFriendsProfile(userUid) {
  try {
    // 1. 현재 사용자의 friends 목록을 가져오기
    const userRef = doc(db, "users", userUid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("사용자 데이터가 없습니다.");
      return;
    }

    const userData = userSnap.data();
    const friendUids = userData.friend || [];  // 친구들의 UID 배열

    // 2. 친구들의 데이터를 가져오기
    const friendsData = [];

    for (const friendUid of friendUids) {
      const friendRef = doc(db, "users", friendUid);
      const friendSnap = await getDoc(friendRef);

      if (friendSnap.exists()) {
        friendsData.push(friendSnap.data());  // 친구 데이터 저장
      } else {
        console.log(`${friendUid} 의 데이터가 존재하지 않습니다.`);
      }
    }

    // 3. 친구들의 데이터를 화면에 반영
    if (friendsData.length === 0) {
      console.log("친구 명함 데이터가 없습니다.");
    }
    friendsData.forEach(friend => {
      createCard(friend);  // createCard 함수로 동적으로 명함 생성
    });

  } catch (err) {
    console.error("친구 명함 불러오기 실패:", err.message);
    alert("친구 명함 불러오기 실패");
  }
}

// 명함 추가 함수
function createCard({ nickname, title, phone, email, website }) {
  const card = document.createElement('div');
  card.classList.add('my_card');

  // 명함 구조 동적으로 삽입
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

// 페이지가 로드될 때 친구 명함 불러오기
window.onload = function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 로그인된 사용자 UID를 가져옵니다
      loadFriendsProfile(user.uid);  // 로그인된 유저의 친구 명함을 불러옵니다
    } else {
      console.log("로그인 상태가 아닙니다.");
      alert("로그인 후 명함을 확인할 수 있습니다.");
    }
  });
}
