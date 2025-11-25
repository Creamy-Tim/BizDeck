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


// 친구들의 명함 데이터를 불러오는 함수
async function loadFriendsProfile(userUid) {
  try {
    const userRef = doc(db, "users", userUid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("사용자 데이터가 없습니다.");
      return;
    }

    const userData = userSnap.data();
    const friendUids = userData.friend || [];  // 친구들의 UID 배열

    // 친구들의 데이터가 제대로 불러와졌는지 확인
    console.log("친구들의 UID 배열:", friendUids);

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
function createCard({ nickname, title, phone, email, website, friend }) {
  // 새로운 명함 요소 생성
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
            <!-- 전화번호 아이콘 SVG -->
            <p class="contact_text_text">${phone || '010-0000-0000'}</p>
        </div>
        <div class="contact">
            <!-- 이메일 아이콘 SVG -->
            <p class="contact_text_text">${email || 'Email'}</p>
        </div>
        <div class="contact">
            <!-- 웹사이트 아이콘 SVG -->
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