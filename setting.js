// Tools 카드 클릭 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    const namecardCards = document.querySelectorAll('.namecard_making');
    const myCard = document.querySelector('.my_card');
    
    // 첫 번째 카드 클릭 시 기본 레이아웃
    if (namecardCards[0]) {
        namecardCards[0].addEventListener('click', function() {
            myCard.classList.remove('layout-2', 'layout-3');
        });
    }
    
    // 두 번째 카드 클릭 시 세 번째 레이아웃
    if (namecardCards[1]) {
        namecardCards[1].addEventListener('click', function() {
            myCard.classList.remove('layout-2');
            myCard.classList.add('layout-3');
        });
    }
    
    // 세 번째 카드 클릭 시 두 번째 레이아웃
    if (namecardCards[2]) {
        namecardCards[2].addEventListener('click', function() {
            myCard.classList.remove('layout-3');
            myCard.classList.add('layout-2');
        });
    }
    
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.font_dropdown');
        const menu = document.getElementById('font_dropdown_menu');
        if (dropdown && menu && !dropdown.contains(event.target)) {
            menu.classList.remove('show');
        }
    });
});

// Font 드롭다운 토글 함수
function toggleFontDropdown() {
    const menu = document.getElementById('font_dropdown_menu');
    const dropdown = document.querySelector('.font_dropdown');
    if (menu && dropdown) {
        const isShowing = menu.classList.contains('show');
        if (!isShowing) {
            // 드롭다운 위치 계산
            const rect = dropdown.getBoundingClientRect();
            menu.style.top = (rect.bottom - rect.top + 8) + 'px';
            menu.style.right = '0px';
        }
        menu.classList.toggle('show');
    }
}

// Font 선택 함수
function selectFont(fontName) {
    const selected = document.getElementById('font_selected');
    if (selected) {
        selected.textContent = fontName;
    }
    const menu = document.getElementById('font_dropdown_menu');
    if (menu) {
        menu.classList.remove('show');
    }
    // 여기에 폰트 적용 로직 추가 가능
}

