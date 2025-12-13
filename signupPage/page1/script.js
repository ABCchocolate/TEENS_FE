// 요소 선택
const emailInput = document.getElementById("useremail");
const userIdInput = document.getElementById("userId");

const sendEmailCodeBtn = document.getElementById("sendEmailCodeBtn");
const checkUserIdBtn = document.getElementById("checkUserIdBtn");
const signupBtn = document.getElementById("signupBtn");

const emailError = document.getElementById("useremailError");
const userIdError = document.getElementById("userIdError");
const generalError = document.getElementById("generalError");

const emailCodeWrapper = document.getElementById("emailCodeWrapper");
const emailCodeInput = document.getElementById("emailCode");
const emailCodeError = document.getElementById("emailCodeError");
const emailTimer = document.getElementById("emailTimer");

let timerInterval = null;
let timeLeft = 180; // 3분

// 이메일 형식 정규식 (ZZZZZ@ZZZZ.com)
const emailRegex = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.com$/;

// -----------------------------
// 초기 상태
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
    sendEmailCodeBtn.disabled = true;
    checkUserIdBtn.disabled = true;
    signupBtn.disabled = true;
    emailCodeWrapper.style.display = "none";
});

// -----------------------------
// 입력 변화 감지 → 버튼 활성/비활성
// -----------------------------
emailInput.addEventListener("input", () => {
    sendEmailCodeBtn.disabled = emailInput.value.trim() === "";
    emailError.textContent = "";
    validateSignupStatus();
});

userIdInput.addEventListener("input", () => {
    checkUserIdBtn.disabled = userIdInput.value.trim() === "";
    userIdError.textContent = "";
    validateSignupStatus();
});

// -----------------------------
// 전체 다음 버튼 활성화 로직
// -----------------------------
function validateSignupStatus() {
    const emailFilled = emailInput.value.trim() !== "";
    const userIdFilled = userIdInput.value.trim() !== "";
    const emailCodeFilled =
        emailCodeWrapper.style.display === "none" ||
        emailCodeInput.value.trim() !== "";

    signupBtn.disabled = !(emailFilled && userIdFilled && emailCodeFilled);
}

// -----------------------------
// 이메일 코드 전송
// -----------------------------
sendEmailCodeBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();

    if (!email) {
        emailError.textContent = "이메일을 입력해주세요.";
        return;
    }

    if (!emailRegex.test(email)) {
        emailError.textContent = "example@domain.com 형식으로 입력해주세요.";
        return;
    }

    emailError.textContent = "";
    alert("인증 코드를 전송했습니다."); // 실제로는 API 호출

    // 인증 코드 입력창 표시
    emailCodeWrapper.style.display = "block";
    emailCodeInput.value = "";
    emailCodeInput.disabled = false;

    // 타이머 초기화
    clearInterval(timerInterval);
    timeLeft = 180;
    updateTimerDisplay();
    timerInterval = setInterval(countdown, 1000);
});

// -----------------------------
// 타이머 카운트다운
// -----------------------------
function countdown() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        emailCodeInput.disabled = true;
        emailCodeError.textContent = "인증 시간이 만료되었습니다.";
        validateSignupStatus();
        return;
    }

    timeLeft--;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    emailTimer.textContent = `${minutes}:${seconds}`;
}

// -----------------------------
// 아이디 중복확인
// -----------------------------
checkUserIdBtn.addEventListener("click", () => {
    const id = userIdInput.value.trim();

    if (!id) {
        userIdError.textContent = "아이디를 입력해주세요.";
        return;
    }

    const dummyUsedIds = ["mare2", "teens", "admin"];

    if (dummyUsedIds.includes(id)) {
        userIdError.textContent = "이미 사용 중인 아이디입니다.";
    } else {
        userIdError.textContent = "";
        alert("사용 가능한 아이디입니다.");
    }

    validateSignupStatus();
});

// -----------------------------
// 다음 버튼 클릭
// -----------------------------
signupBtn.addEventListener("click", () => {
    const code = emailCodeInput.value.trim();

    if (emailCodeWrapper.style.display !== "none" && code.length !== 6) {
        emailCodeError.textContent = "6자리 인증코드를 입력해주세요.";
        return;
    }

    emailCodeError.textContent = "";
    alert("다음 단계로 이동합니다.");
    // location.href = "../page2/index.html";
});
