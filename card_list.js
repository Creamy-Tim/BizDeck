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

// 친구들의 명함을 동적으로 생성하는 함수
async function loadFriendsProfile(userUid) {
    try {
        // 1. 현재 로그인된 유저의 친구 목록 가져오기
        const userRef = doc(db, "users", userUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("사용자 데이터가 없습니다.");
            return;
        }

        const userData = userSnap.data();
        const friendUids = userData.friends || [];  // ✅ card.js에서 저장한 필드 이름과 맞추기

        console.log("친구들의 UID 배열:", friendUids);

        // 2. 친구들의 데이터를 가져와서 명함 생성
        const cardsContainer = document.getElementById('my_card');
        cardsContainer.innerHTML = "";  // 기존 명함 지우기

        if (friendUids.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "등록된 친구 명함이 없습니다.";
            emptyMsg.style.margin = "16px";
            cardsContainer.appendChild(emptyMsg);
            return;
        }

        for (const friendUid of friendUids) {
            const friendRef = doc(db, "users", friendUid);
            const friendSnap = await getDoc(friendRef);

            if (friendSnap.exists()) {
                const friendData = friendSnap.data();
                createCard(friendUid, friendData);  // ✅ friendUid 같이 넘기기
            } else {
                console.log(`친구 데이터가 없음: ${friendUid}`);
            }
        }

    } catch (err) {
        console.error("친구 명함 불러오기 실패:", err.message);
        alert("친구 명함 불러오기 실패");
    }
}

function createCard(friendUid, friendData) {
    const { nickname, name, title, phone, email, website, card_color } = friendData;
    const displayName  = nickname || name || "Name";
    const displayJob   = title    || "Job";
    const displayPhone = phone    || "010-0000-0000";
    const displayEmail = email    || "Email";
    const displaySite  = website  || "Website";

    const card = document.createElement('div');
    card.classList.add('my_card');

    card.innerHTML = `
        <div class="my_name">
        <p class="my_name_text">${displayName}</p>
        </div>
        <div class="my_job">
        <p class="my_job_text">${displayJob}</p>
        </div>
        <div class="contact_case">
        <div class="contact">
            <div class="contact_text">
            <p class="contact_text_text">${displayPhone}</p>
            </div>
        </div>
        <div class="contact">
            <div class="contact_text">
            <p class="contact_text_text">${displayEmail}</p>
            </div>
        </div>
        <div class="contact">
            <div class="contact_text">
            <p class="contact_text_text">${displaySite}</p>
            </div>
        </div>
        </div>
        <div class="logo">
        <img src="./assets/img/BizDeck_logo.svg" class="logo_img">
        </div>
    `;

    card.onclick = () => openDetail(friendUid, friendData);

    const detailView = document.getElementById("detailView");
    if (detailView) {
    detailView.style.display = "block";
    } else {
    console.error("detailView 요소를 찾을 수 없습니다.");
    }


    const cardsContainer = document.getElementById('my_card');
    cardsContainer.appendChild(card);

    const card_background_color = card_color || "#FE5858";

    card.style.background = card_background_color;


    console.log("불러온 색상 값:", card_background_color);
}


// 로그인 상태 감지 후 친구 명함 로드
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("로그인된 유저:", user.email);
        // 로그인된 유저의 UID를 가져와서 친구 명함을 로드
        loadFriendsProfile(user.uid);
    } else {
        console.log("로그인되지 않았습니다.");
        alert("로그인 후 명함을 확인할 수 있습니다.");
    }
});







/* ---------------------------
카드 상세 데이터
--------------------------- */
const cardData = {
    1: {
        image: "/mnt/data/CARD LIST - 카드 상세 보기.png",
        tools: "Figma · Adobe XD · Illustrator · Photoshop · After Effects · Notion",
        career: `
            2023-현재<br>Gildam Studio(길담 스튜디오)<br>Lead UX Designer<br><br>
            2021-2023<br>BlueBean Creative<br>Junior Visual Designer<br><br>
            2021<br>연세대학교 미래캠퍼스 시각디자인전공 졸업
        `
    },

    2: {
        image: "/mnt/data/CARD LIST - 카드 상세 보기.png",
        tools: "Python · C++ · Embedded · PCB Designing",
        career: `2022-현재<br>HP Korea Engineer`
    },

    3: {
        image: "/mnt/data/CARD LIST - 카드 상세 보기.png",
        tools: "Notion · Figma · Excel · Communication Design",
        career: `2020-현재<br>Product Planner`
    }
};


/* ---------------------------
상세 카드 열기
--------------------------- */
function openDetail(id, data = {}) {
  if (!data || Object.keys(data).length === 0) {
    console.error("openDetail: 친구 데이터가 없습니다. id =", id);
    alert("명함 정보를 불러올 수 없습니다.");
    return;
  }

  const {
    nickname, name, title, phone, email, website,
    card_color,
    tools = "",       // Firebase 에서 가져온 tools (명함 상세 스킬 등)
    career = ""       // Firebase 에서 가져온 career / 경력 정보 등
  } = data;

  const displayName = nickname || name || "Name";
  const displayJob  = title || "Job";
  const displayPhone = phone || "010-0000-0000";
  const displayEmail = email || "Email";
  const displaySite  = website || "Website";
  const bgColor = card_color || "#FE5858";

  document.getElementById("my_card").style.display = "none";
  document.getElementById("detailView").style.display = "block";

  document.getElementById("detailView").innerHTML = `
    <div class="detail-wrapper">
        <div class="detail-card" style="background:${bgColor}">
            <img src="assets/img/detail.jpg" class="detail-top-img">

            <div class="detail-profile">
            <div class="detail-name">${displayName}</div>
            <div class="detail-job">${displayJob}</div>

            <div class="detail-contacts">
                <p>📞 ${displayPhone}</p>
                <p>📧 ${displayEmail}</p>
                <p>🌐 ${displaySite}</p>
            </div>

            ${ tools ? `
                <div class="info-section">
                <div class="info-section-title">USING TOOLS</div>
                <div class="tools-list">${tools}</div>
                </div>
            ` : "" }

            ${ career ? `
                <div class="info-section">
                <div class="info-section-title">CAREER</div>
                <div class="career-box">${career}</div>
                </div>
            ` : "" }
            </div>
        </div>

        <div class="back-btn" onclick="closeDetail()">← Back to List</div>
    </div>
  `;
}


function closeDetail() {
    document.getElementById("detailView").style.display = "none";
    document.getElementById
}