// Firebase 모듈을 개별적으로 임포트
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Firebase 인증 객체 초기화
const auth = getAuth();

// 로그인 상태 감지
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 사용자가 로그인되어 있을 때
    console.log("로그인된 사용자:", user.email);  // 로그인된 사용자 정보 확인

    // 로그인 후 수정 가능 처리
    loadProfile(user.uid);  // user.uid로 프로필 정보 불러오기
  } else {
    // 로그인되지 않은 경우
    console.log("로그인되지 않은 상태입니다.");
    alert("로그인 후 수정이 가능합니다.");  // 로그인 안내
    location.href = 'login.html';  // 로그인 페이지로 이동
  }
});

// 프로필을 불러오는 함수
async function loadProfile(userUid) {
  try {
    const userRef = doc(db, "users", userUid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("사용자 데이터가 없습니다.");
      return;
    }

    const userData = userSnap.data();
    console.log("불러온 사용자 데이터:", userData);

    // 프로필을 화면에 업데이트
    document.getElementById("nameEl").value = userData.nickname || '';
    document.getElementById("titleEl").value = userData.title || '';
    document.getElementById("contactEl").value = userData.phone || '';
    document.getElementById("emailEl").value = userData.email || '';
    document.getElementById("websiteEl").value = userData.website || '';

  } catch (err) {
    console.error("프로필 불러오기 실패:", err.message);
  }
}

// 명함 저장하기 함수
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

  try {
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
    loadProfile(user.uid);  // 저장 후 프로필을 다시 불러오기

  } catch (err) {
    console.error("Firestore에 저장 실패:", err.message);
  }
}
