// -----------------------------
// DOM 요소 선택
// -----------------------------
const signupForm = document.getElementById("loginForm"); // 네가 준 HTML 기준
const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("passwordConfirm");

const togglePasswordBtn = document.getElementById("togglePassword");
const toggleConfirmPasswordBtn = document.getElementById("togglePasswordConfirm");

const togglePasswordIcon = document.getElementById("toggleIcon");
const toggleConfirmPasswordIcon = document.getElementById("toggleIconConfirm");

const passwordError = document.getElementById("passwordError");
const passwordConfirmError = document.getElementById("passwordConfirmError");
const generalError = document.getElementById("generalError");

const signupBtn = document.getElementById("signupBtn");

let pwVisible = false;
let pwConfirmVisible = false;

// -----------------------------
// 비밀번호/비밀번호 확인 보기 토글
// -----------------------------
togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    pwVisible = !pwVisible;
    passwordInput.type = pwVisible ? "text" : "password";
    togglePasswordIcon.innerHTML = pwVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
});

toggleConfirmPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    pwConfirmVisible = !pwConfirmVisible;
    passwordConfirmInput.type = pwConfirmVisible ? "text" : "password";
    toggleConfirmPasswordIcon.innerHTML = pwConfirmVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
});

// -----------------------------
// 입력 감지 → 실시간 검증
// -----------------------------
passwordInput.addEventListener("input", validateForm);
passwordConfirmInput.addEventListener("input", validateForm);

// -----------------------------
// 개별 검증 함수
// -----------------------------
function validatePassword() {
    const pw = passwordInput.value.trim();
    if (!pw) {
        passwordError.textContent = "비밀번호를 입력해주세요.";
        return false;
    }
    if (pw.length > 25) {
        passwordError.textContent = "비밀번호는 25자 이내로 입력해주세요.";
        return false;
    }
    passwordError.textContent = "";
    return true;
}

function validatePasswordConfirm() {
    const pw = passwordInput.value.trim();
    const pwc = passwordConfirmInput.value.trim();
    if (!pwc) {
        passwordConfirmError.textContent = "비밀번호 확인을 입력해주세요.";
        return false;
    }
    if (pw !== pwc) {
        passwordConfirmError.textContent = "비밀번호가 일치하지 않습니다.";
        return false;
    }
    passwordConfirmError.textContent = "";
    return true;
}

// -----------------------------
// 전체 폼 검증 → 버튼 활성/비활성
// -----------------------------
function validateForm() {
    generalError.textContent = "";
    const pwValid = validatePassword();
    const pwcValid = validatePasswordConfirm();
    signupBtn.disabled = !(pwValid && pwcValid);
}

// -----------------------------
// 제출 이벤트 → 백엔드 연동 구조
// -----------------------------
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    generalError.textContent = "";

    // 마지막 방어적 검증
    if (signupBtn.disabled) {
        generalError.textContent = "필수 정보를 모두 입력해주세요.";
        return;
    }

    const password = passwordInput.value.trim();

    // -----------------------------
    // 백엔드 연동 시 fetch() 사용
    // -----------------------------
    /*
    try {
        const response = await fetch("/api/signup/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            generalError.textContent = data.message || "서버 오류가 발생했습니다.";
            return;
        }
    } catch (error) {
        generalError.textContent = "서버 연결 실패";
        return;
    }
    */

    alert("회원가입이 완료되었습니다..");
    window.location.href = ".../mainPage/index.html";  // 실제 메인 페이지 경로로 변경
});
