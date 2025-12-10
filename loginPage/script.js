// 더미 사용자 데이터
const validUsers = {
  mare2mare6: "mare2mare6",
  user1: "pass1234",
  teens: "teens1234",
};

// DOM 요소
const loginForm = document.getElementById("loginForm");
const userIdInput = document.getElementById("userId");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const togglePasswordBtn = document.getElementById("togglePassword");
const toggleIcon = document.getElementById("toggleIcon");

const userIdError = document.getElementById("userIdError");
const passwordError = document.getElementById("passwordError");
const generalError = document.getElementById("generalError");

let passwordVisible = false;

// 비밀번호 표시/숨김 토글
togglePasswordBtn.addEventListener("click", (e) => {
  e.preventDefault();
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? "text" : "password";

  toggleIcon.innerHTML = passwordVisible
    ? '<i class="fa-solid fa-eye"></i>'
    : '<i class="fa-solid fa-eye-slash"></i>';
});

// 입력 필드 변경 감지
userIdInput.addEventListener("input", validateForm);
passwordInput.addEventListener("input", validateForm);

function validateForm() {
  clearAllErrors();

  const userId = userIdInput.value.trim();
  const password = passwordInput.value;

  // 버튼 활성화 조건: 두 필드 모두 입력되어 있을 때
  if (!userId || !password) {
    loginBtn.disabled = true;
    return;
  }

  loginBtn.disabled = false;
}

// 모든 에러 메시지 초기화
function clearAllErrors() {
  userIdError.textContent = "";
  passwordError.textContent = "";
  generalError.textContent = "";
}

// 로그인 폼 제출
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearAllErrors();

  const userId = userIdInput.value.trim();
  const password = passwordInput.value;

  // 1. 필드 검증
  if (!userId || !password) {
    generalError.textContent = "모든 항목을 입력해주세요.";
    return;
  }

  if (!userId.trim() || !password.trim()) {
    generalError.textContent = "아이디 또는 비밀번호를 입력해 주세요.";
    return;
  }

  // 2. 비밀번호 길이 검증 (25자 이내)
  if (password.length > 25) {
    passwordError.textContent = "비밀번호는 25자 이내로 입력해주세요.";
    return;
  }

  
  // 4. 비밀번호 일치 여부 확인
  if (validUsers[userId] !== password) {
    generalError.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    return;
  }

  // 로그인 성공
  alert(`${userId}님 환영합니다!`);
  console.log("[Login Success] User:", userId);
  
  // 실제 프로젝트에서는 아래 주석을 해제하여 페이지 이동
  // window.location.href = '/home';
});