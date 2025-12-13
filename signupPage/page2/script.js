// -----------------------------
// API 설정 - 실제 백엔드 서버 주소로 변경 필요
// -----------------------------
const API_BASE_URL = "https://your-api-server.com/auth"

// -----------------------------
// 1페이지에서 전달받은 데이터 확인
// -----------------------------
const SignupData = {
  get email() {
    return sessionStorage.getItem("signup_email")
  },
  get username() {
    return sessionStorage.getItem("signup_username")
  },
  get emailVerified() {
    return sessionStorage.getItem("signup_email_verified") === "true"
  },
  get usernameVerified() {
    return sessionStorage.getItem("signup_username_verified") === "true"
  },
  clear() {
    sessionStorage.removeItem("signup_email")
    sessionStorage.removeItem("signup_username")
    sessionStorage.removeItem("signup_email_verified")
    sessionStorage.removeItem("signup_username_verified")
  },
  isValid() {
    return this.email && this.username && this.emailVerified && this.usernameVerified
  },
}

// -----------------------------
// 페이지 로드 시 1페이지 데이터 확인
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (!SignupData.isValid()) {
    alert("이메일 인증과 아이디 확인을 먼저 완료해주세요.")
    window.location.href = "../index.html" // 1페이지로 리다이렉트
    return
  }
})

// -----------------------------
// DOM 요소 선택
// -----------------------------
const signupForm = document.getElementById("signupForm")
const passwordInput = document.getElementById("password")
const passwordConfirmInput = document.getElementById("passwordConfirm")

const togglePasswordBtn = document.getElementById("togglePassword")
const toggleConfirmPasswordBtn = document.getElementById("togglePasswordConfirm")

const togglePasswordIcon = document.getElementById("toggleIcon")
const toggleConfirmPasswordIcon = document.getElementById("toggleIconConfirm")

const passwordError = document.getElementById("passwordError")
const passwordConfirmError = document.getElementById("passwordConfirmError")
const generalError = document.getElementById("generalError")

const signupBtn = document.getElementById("signupBtn")

let pwVisible = false
let pwConfirmVisible = false
let isSubmitting = false

// -----------------------------
// 비밀번호 보기 토글
// -----------------------------
togglePasswordBtn.addEventListener("click", (e) => {
  e.preventDefault()
  pwVisible = !pwVisible
  passwordInput.type = pwVisible ? "text" : "password"
  togglePasswordIcon.innerHTML = pwVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>'
})

toggleConfirmPasswordBtn.addEventListener("click", (e) => {
  e.preventDefault()
  pwConfirmVisible = !pwConfirmVisible
  passwordConfirmInput.type = pwConfirmVisible ? "text" : "password"
  toggleConfirmPasswordIcon.innerHTML = pwConfirmVisible
    ? '<i class="fa-solid fa-eye"></i>'
    : '<i class="fa-solid fa-eye-slash"></i>'
})

// -----------------------------
// 입력 감지 → 실시간 검증
// -----------------------------
passwordInput.addEventListener("input", validateForm)
passwordConfirmInput.addEventListener("input", validateForm)

// -----------------------------
// 개별 검증 함수
// -----------------------------
function validatePassword() {
  const pw = passwordInput.value.trim()

  if (!pw) {
    passwordError.textContent = "비밀번호를 입력해주세요."
    return false
  }

  if (pw.length < 8) {
    passwordError.textContent = "비밀번호는 8자 이상이어야 합니다."
    return false
  }

  if (pw.length > 25) {
    passwordError.textContent = "비밀번호는 25자 이내로 입력해주세요."
    return false
  }

  // 비밀번호 규칙: 영문, 숫자, 특수문자 포함 권장
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)

  if (!hasLetter || !hasNumber) {
    passwordError.textContent = "비밀번호는 영문과 숫자를 포함해야 합니다."
    return false
  }

  passwordError.textContent = ""
  return true
}

function validatePasswordConfirm() {
  const pw = passwordInput.value.trim()
  const pwc = passwordConfirmInput.value.trim()

  if (!pwc) {
    passwordConfirmError.textContent = "비밀번호 확인을 입력해주세요."
    return false
  }

  if (pw !== pwc) {
    passwordConfirmError.textContent = "비밀번호가 일치하지 않습니다."
    return false
  }

  passwordConfirmError.textContent = ""
  return true
}

// -----------------------------
// 전체 폼 검증 → 버튼 활성/비활성
// -----------------------------
function validateForm() {
  generalError.textContent = ""
  const pwValid = validatePassword()
  const pwcValid = validatePasswordConfirm()
  signupBtn.disabled = !(pwValid && pwcValid)
}

// -----------------------------
// 에러 메시지 매핑
// -----------------------------
function getSignupErrorMessage(status, data) {
  switch (status) {
    case 400:
      // 서버에서 전달하는 메시지 우선 사용
      if (data && data.message) {
        return data.message
      }
      return "입력 정보를 확인해주세요."
    case 401:
      return "인증이 만료되었습니다. 다시 시도해주세요."
    case 404:
      return "요청한 리소스를 찾을 수 없습니다."
    case 409:
      return "이미 존재하는 계정입니다."
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    default:
      return "회원가입에 실패했습니다. 다시 시도해주세요."
  }
}

// -----------------------------
// 회원가입 API 호출
// -----------------------------
async function submitSignup(username, email, password) {
  const response = await fetch(`${API_BASE_URL}/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  })

  // 201 Created = 성공
  if (response.status === 201) {
    return { success: true }
  }

  // 에러 응답 처리
  let errorData = null
  try {
    errorData = await response.json()
  } catch (e) {
    // JSON 파싱 실패 시 무시
  }

  return {
    success: false,
    status: response.status,
    data: errorData,
  }
}

// -----------------------------
// 제출 이벤트 → 백엔드 연동
// -----------------------------
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  generalError.textContent = ""

  // 중복 제출 방지
  if (isSubmitting) return

  // 마지막 방어적 검증
  if (signupBtn.disabled) {
    generalError.textContent = "필수 정보를 모두 입력해주세요."
    return
  }

  // 1페이지 데이터 재확인
  if (!SignupData.isValid()) {
    generalError.textContent = "이메일 인증과 아이디 확인이 필요합니다."
    setTimeout(() => {
      window.location.href = "../index.html"
    }, 1500)
    return
  }

  const password = passwordInput.value.trim()
  const email = SignupData.email
  const username = SignupData.username

  // 로딩 상태
  isSubmitting = true
  const originalText = signupBtn.textContent
  signupBtn.textContent = "가입 처리 중..."
  signupBtn.disabled = true

  try {
    const result = await submitSignup(username, email, password)

    if (result.success) {
      // 회원가입 성공
      SignupData.clear() // sessionStorage 정리
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.")
      window.location.href = "../index.html" // 로그인 페이지로 이동
    } else {
      // 회원가입 실패
      generalError.textContent = getSignupErrorMessage(result.status, result.data)
    }
  } catch (error) {
    // 네트워크 오류
    generalError.textContent = "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
  } finally {
    // 로딩 상태 해제
    isSubmitting = false
    signupBtn.textContent = originalText
    validateForm() // 버튼 상태 재검증
  }
})
