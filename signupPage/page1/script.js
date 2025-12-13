// =============================================
// API 설정
// =============================================
const API_BASE_URL = "https://your-api-domain.com/auth" // 실제 백엔드 URL로 변경 필요

// =============================================
// 회원가입 데이터 임시 저장 (2페이지로 전달용)
// =============================================
const SignupStorage = {
  save: (data) => {
    sessionStorage.setItem("signupData", JSON.stringify(data))
  },
  get: () => {
    const data = sessionStorage.getItem("signupData")
    return data ? JSON.parse(data) : null
  },
  clear: () => {
    sessionStorage.removeItem("signupData")
  },
}

// =============================================
// 요소 선택
// =============================================
const emailInput = document.getElementById("useremail")
const userIdInput = document.getElementById("userId")

const sendEmailCodeBtn = document.getElementById("sendEmailCodeBtn")
const verifyEmailCodeBtn = document.getElementById("verifyEmailCodeBtn")
const checkUserIdBtn = document.getElementById("checkUserIdBtn")
const signupBtn = document.getElementById("signupBtn")

const emailError = document.getElementById("useremailError")
const userIdError = document.getElementById("userIdError")
const generalError = document.getElementById("generalError")

const emailCodeWrapper = document.getElementById("emailCodeWrapper")
const emailCodeInput = document.getElementById("emailCode")
const emailCodeError = document.getElementById("emailCodeError")
const emailTimer = document.getElementById("emailTimer")

let timerInterval = null
let timeLeft = 180 // 3분

// 인증 상태 추적
let isEmailVerified = false
let isUserIdAvailable = false
let verifiedEmail = ""
let verifiedUserId = ""

// 이메일 형식 정규식
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$/

// 아이디 규칙 정규식 (4~20자, 영문/숫자/- _ . 허용)
const usernameRegex = /^[A-Za-z0-9\-_.]{4,20}$/

// =============================================
// 초기 상태
// =============================================
window.addEventListener("DOMContentLoaded", () => {
  sendEmailCodeBtn.disabled = true
  checkUserIdBtn.disabled = true
  signupBtn.disabled = true
  emailCodeWrapper.style.display = "none"

  // 이전에 저장된 데이터가 있으면 초기화
  SignupStorage.clear()
})

// =============================================
// 입력 변화 감지
// =============================================
emailInput.addEventListener("input", () => {
  sendEmailCodeBtn.disabled = emailInput.value.trim() === ""
  emailError.textContent = ""

  // 이메일이 변경되면 인증 상태 초기화
  if (verifiedEmail !== emailInput.value.trim()) {
    isEmailVerified = false
    verifiedEmail = ""
  }

  validateSignupStatus()
})

userIdInput.addEventListener("input", () => {
  checkUserIdBtn.disabled = userIdInput.value.trim() === ""
  userIdError.textContent = ""

  // 아이디가 변경되면 중복확인 상태 초기화
  if (verifiedUserId !== userIdInput.value.trim()) {
    isUserIdAvailable = false
    verifiedUserId = ""
  }

  validateSignupStatus()
})

emailCodeInput.addEventListener("input", () => {
  emailCodeError.textContent = ""
  validateSignupStatus()
})

// =============================================
// 전체 다음 버튼 활성화 로직
// =============================================
function validateSignupStatus() {
  // 이메일 인증 완료 + 아이디 중복확인 완료 시에만 활성화
  signupBtn.disabled = !(isEmailVerified && isUserIdAvailable)
}

// =============================================
// 이메일 인증 코드 전송 (API 연동)
// =============================================
sendEmailCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim()

  if (!email) {
    emailError.textContent = "이메일을 입력해주세요."
    return
  }

  if (!emailRegex.test(email)) {
    emailError.textContent = "example@domain.com 형식으로 입력해주세요."
    return
  }

  emailError.textContent = ""
  sendEmailCodeBtn.disabled = true
  sendEmailCodeBtn.textContent = "전송중..."

  try {
    const response = await fetch(`${API_BASE_URL}/verify-email/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })

    if (response.status === 202) {
      // 성공: 인증 코드 입력창 표시
      emailCodeWrapper.style.display = "block"
      emailCodeInput.value = ""
      emailCodeInput.disabled = false
      isEmailVerified = false

      // 타이머 시작
      clearInterval(timerInterval)
      timeLeft = 180
      updateTimerDisplay()
      timerInterval = setInterval(countdown, 1000)

      emailError.textContent = ""
      showSuccessMessage(emailError, "인증 코드가 발송되었습니다.")
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      emailError.textContent = errorData.message || "이메일 형식이 올바르지 않거나 이미 인증된 이메일입니다."
    } else if (response.status === 409) {
      emailError.textContent = "이미 가입된 이메일입니다."
    } else {
      emailError.textContent = "인증 코드 발송에 실패했습니다. 다시 시도해주세요."
    }
  } catch (error) {
    console.error("Email verification request error:", error)
    emailError.textContent = "서버 연결에 실패했습니다. 네트워크를 확인해주세요."
  } finally {
    sendEmailCodeBtn.disabled = false
    sendEmailCodeBtn.textContent = "코드전송"
  }
})

// =============================================
// 이메일 인증 코드 확인 (API 연동)
// =============================================
verifyEmailCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim()
  const code = emailCodeInput.value.trim()

  if (!code) {
    emailCodeError.textContent = "인증 코드를 입력해주세요."
    return
  }

  if (code.length !== 6) {
    emailCodeError.textContent = "6자리 인증코드를 입력해주세요."
    return
  }

  verifyEmailCodeBtn.disabled = true
  verifyEmailCodeBtn.textContent = "확인중..."

  try {
    const response = await fetch(`${API_BASE_URL}/verify-email/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        code: code,
      }),
    })

    if (response.status === 204) {
      // 성공: 이메일 인증 완료
      isEmailVerified = true
      verifiedEmail = email

      // 타이머 정지
      clearInterval(timerInterval)

      // UI 업데이트
      emailCodeInput.disabled = true
      emailInput.disabled = true
      sendEmailCodeBtn.disabled = true

      emailCodeError.textContent = ""
      showSuccessMessage(emailCodeError, "이메일 인증이 완료되었습니다.")

      validateSignupStatus()
    } else if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}))
      emailCodeError.textContent = errorData.message || "인증 코드가 일치하지 않거나 만료되었습니다."
    } else {
      emailCodeError.textContent = "인증 확인에 실패했습니다. 다시 시도해주세요."
    }
  } catch (error) {
    console.error("Email code verification error:", error)
    emailCodeError.textContent = "서버 연결에 실패했습니다. 네트워크를 확인해주세요."
  } finally {
    verifyEmailCodeBtn.disabled = false
    verifyEmailCodeBtn.textContent = "인증확인"
  }
})

// =============================================
// 타이머 카운트다운
// =============================================
function countdown() {
  if (timeLeft <= 0) {
    clearInterval(timerInterval)
    emailCodeInput.disabled = true
    emailCodeError.textContent = "인증 시간이 만료되었습니다. 코드를 다시 전송해주세요."
    validateSignupStatus()
    return
  }

  timeLeft--
  updateTimerDisplay()
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const seconds = String(timeLeft % 60).padStart(2, "0")
  emailTimer.textContent = `${minutes}:${seconds}`
}

// =============================================
// 아이디 중복확인 (API 연동)
// =============================================
checkUserIdBtn.addEventListener("click", async () => {
  const username = userIdInput.value.trim()

  if (!username) {
    userIdError.textContent = "아이디를 입력해주세요."
    return
  }

  // 아이디 규칙 검증
  if (!usernameRegex.test(username)) {
    userIdError.textContent = "4~20자의 영문, 숫자, 특수문자(- _ .)만 사용 가능합니다."
    return
  }

  checkUserIdBtn.disabled = true
  checkUserIdBtn.textContent = "확인중..."

  try {
    const response = await fetch(`${API_BASE_URL}/check-id?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 200) {
      const data = await response.json()

      if (data.isAvailable) {
        isUserIdAvailable = true
        verifiedUserId = username
        userIdError.textContent = ""
        showSuccessMessage(userIdError, "사용 가능한 아이디입니다.")
      } else {
        isUserIdAvailable = false
        verifiedUserId = ""
        userIdError.textContent = "이미 사용 중인 아이디입니다."
      }
    } else if (response.status === 400) {
      userIdError.textContent = "아이디 형식이 올바르지 않습니다."
      isUserIdAvailable = false
    } else if (response.status === 409) {
      userIdError.textContent = "이미 사용 중인 아이디입니다."
      isUserIdAvailable = false
    } else {
      userIdError.textContent = "중복 확인에 실패했습니다. 다시 시도해주세요."
      isUserIdAvailable = false
    }
  } catch (error) {
    console.error("Username check error:", error)
    userIdError.textContent = "서버 연결에 실패했습니다. 네트워크를 확인해주세요."
    isUserIdAvailable = false
  } finally {
    checkUserIdBtn.disabled = false
    checkUserIdBtn.textContent = "중복확인"
    validateSignupStatus()
  }
})

// =============================================
// 다음 버튼 클릭 (2페이지로 이동)
// =============================================
signupBtn.addEventListener("click", () => {
  // 최종 검증
  if (!isEmailVerified) {
    generalError.textContent = "이메일 인증을 완료해주세요."
    return
  }

  if (!isUserIdAvailable) {
    generalError.textContent = "아이디 중복확인을 해주세요."
    return
  }

  // 입력값이 인증된 값과 일치하는지 확인
  if (emailInput.value.trim() !== verifiedEmail) {
    generalError.textContent = "이메일이 변경되었습니다. 다시 인증해주세요."
    isEmailVerified = false
    validateSignupStatus()
    return
  }

  if (userIdInput.value.trim() !== verifiedUserId) {
    generalError.textContent = "아이디가 변경되었습니다. 다시 중복확인해주세요."
    isUserIdAvailable = false
    validateSignupStatus()
    return
  }

  generalError.textContent = ""

  // 데이터 저장 후 2페이지로 이동
  SignupStorage.save({
    email: verifiedEmail,
    username: verifiedUserId,
  })

  // 2페이지로 이동 (경로는 실제 구조에 맞게 수정 필요)
  window.location.href = "../signup2/index.html"
})

// =============================================
// 유틸리티 함수
// =============================================
function showSuccessMessage(element, message) {
  element.textContent = message
  element.style.color = "var(--success)"

  // 3초 후 원래 색상으로 복원
  setTimeout(() => {
    element.style.color = ""
  }, 3000)
}
