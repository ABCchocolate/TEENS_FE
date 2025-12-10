// 요소 선택
const emailInput = document.getElementById("useremail");
const userIdInput = document.getElementById("userId");

const sendEmailCodeBtn = document.getElementById("sendEmailCodeBtn");
const checkUserIdBtn = document.getElementById("checkUserIdBtn");
const signupBtn = document.getElementById("signupBtn");

const emailError = document.getElementById("useremailError");
const userIdError = document.getElementById("userIdError");
const generalError = document.getElementById("generalError");


window.addEventListener("DOMContentLoaded", () => {
    sendEmailCodeBtn.disabled = true;
    checkUserIdBtn.disabled = true;
    signupBtn.disabled = true;
});


// -----------------------------
// 입력 변화 감지 → 버튼 활성/비활성
// -----------------------------
emailInput.addEventListener("input", () => {
    if (emailInput.value.trim() !== "") {
        sendEmailCodeBtn.disabled = false;
    } else {
        sendEmailCodeBtn.disabled = true;
    }
    validateSignupStatus();
});

userIdInput.addEventListener("input", () => {
    if (userIdInput.value.trim() !== "") {
        checkUserIdBtn.disabled = false;
    } else {
        checkUserIdBtn.disabled = true;
    }
    validateSignupStatus();
});


// -----------------------------
// 전체 다음 버튼 활성화 로직
// -----------------------------
function validateSignupStatus() {
    const email = emailInput.value.trim();
    const userId = userIdInput.value.trim();

    if (email && userId) {
        signupBtn.disabled = false;
    } else {
        signupBtn.disabled = true;
    }
}


// -----------------------------
// 이메일 코드 전송 버튼
// -----------------------------
sendEmailCodeBtn.addEventListener("click", () => {
    if (!emailInput.value.trim()) {
        emailError.textContent = "이메일을 입력해주세요.";
        return;
    }

    emailError.textContent = "";
    alert("인증 코드를 전송했습니다.");   // 실제로는 API 호출
});


// -----------------------------
// 아이디 중복확인 버튼
// -----------------------------
checkUserIdBtn.addEventListener("click", () => {
    const id = userIdInput.value.trim();

    if (!id) {
        userIdError.textContent = "아이디를 입력해주세요.";
        return;
    }

    // 실제 프로젝트에서는 서버에 중복 확인 요청
    const dummyUsedIds = ["mare2", "teens", "admin"];

    if (dummyUsedIds.includes(id)) {
        userIdError.textContent = "이미 사용 중인 아이디입니다.";
    } else {
        userIdError.textContent = "";
        alert("사용 가능한 아이디입니다.");
    }
});


// -----------------------------
// 회원가입 제출
// -----------------------------
document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault();

    generalError.textContent = "";

    if (signupBtn.disabled) {
        generalError.textContent = "모든 정보를 입력해주세요.";
        return;
    }

    alert("회원가입 완료!");
});
