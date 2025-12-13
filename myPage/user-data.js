/**
 * user-data.js
 *
 * 마이페이지 백엔드 연동 JavaScript
 * API 명세서 기반으로 작성됨
 */

const API_BASE_URL = "https://api.example.com" // TODO: 실제 API 주소로 교체

/* =====================
   토큰 관리
   ===================== */

/**
 * localStorage에서 Access Token 가져오기
 * 보안상 httpOnly 쿠키 사용이 더 안전하지만, 현재는 localStorage 사용
 */
function getAccessToken() {
  return localStorage.getItem("accessToken")
}

/**
 * localStorage에서 Refresh Token 가져오기
 */
function getRefreshToken() {
  return localStorage.getItem("refreshToken")
}

/**
 * 토큰 저장
 */
function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken)
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken)
  }
}

/**
 * 로그인 여부 확인
 */
function isLoggedIn() {
  return !!getAccessToken()
}

/* =====================
   공통 Fetch 함수
   ===================== */

/**
 * 인증이 필요한 API 요청을 처리하는 공통 함수
 * 401 에러 시 자동으로 토큰 갱신 시도
 */
async function authFetch(url, options = {}) {
  // Access Token이 없으면 로그인 페이지로 리다이렉트
  if (!isLoggedIn()) {
    alert("로그인이 필요합니다.")
    window.location.href = "login.html"
    return
  }

  // Authorization 헤더 추가
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })

  // 401 Unauthorized - Access Token 만료
  if (res.status === 401) {
    console.log("[v0] Access token expired, attempting refresh")
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      return authFetch(url, options)
    } else {
      // 토큰 갱신 실패 시 로그인 페이지로
      alert("세션이 만료되었습니다. 다시 로그인해주세요.")
      localStorage.clear()
      window.location.href = "login.html"
      return
    }
  }

  return res
}

/* =====================
   토큰 갱신
   ===================== */

/**
 * Refresh Token으로 새로운 Access Token 발급
 * API 명세서에 따르면 POST /refresh 사용
 */
async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return false
  }

  try {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: refreshToken,
        fcmToken: null, // FCM 토큰은 선택사항
      }),
    })

    if (!res.ok) {
      console.error("[v0] Token refresh failed:", res.status)
      return false
    }

    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    console.log("[v0] Token refreshed successfully")
    return true
  } catch (error) {
    console.error("[v0] Token refresh error:", error)
    return false
  }
}

/* =====================
   마이페이지 조회
   ===================== */

/**
 * GET /user/me
 * 사용자 프로필 정보 조회 및 화면 업데이트
 */
async function loadMyPage() {
  console.log("[v0] Loading my page data")

  const res = await authFetch(`${API_BASE_URL}/user/me`)

  if (!res) return // authFetch에서 리다이렉트 처리됨

  if (!res.ok) {
    alert("마이페이지 정보를 불러올 수 없습니다.")
    return
  }

  const data = await res.json()
  console.log("[v0] User data loaded:", data)

  // API 응답 구조: { username, nickname, email, forumCount, commentCount }
  document.getElementById("nickname").textContent = data.nickname
  document.getElementById("username").textContent = `@${data.username}`
  document.getElementById("email").textContent = data.email
  document.getElementById("forumCount").textContent = data.forumCount
  document.getElementById("commentCount").textContent = data.commentCount
}

// 페이지 로드 시 사용자 정보 가져오기
document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    alert("로그인이 필요합니다.")
    window.location.href = "login.html"
    return
  }
  loadMyPage()
})

/* =====================
   닉네임 변경
   ===================== */

function openNicknameModal() {
  const currentNickname = document.getElementById("nickname").textContent
  document.getElementById("nicknameInput").value = currentNickname
  document.getElementById("nicknameModal").classList.remove("hidden")
}

/**
 * PUT /nickname
 * 닉네임 변경 API 호출
 * 규칙: 2-10자, 영문/한글/숫자/특수문자(-_.) 허용
 */
async function changeNickname() {
  const nickname = document.getElementById("nicknameInput").value.trim()

  // 클라이언트 측 유효성 검사
  if (!nickname) {
    alert("닉네임을 입력해주세요.")
    return
  }

  if (nickname.length < 2 || nickname.length > 10) {
    alert("닉네임은 2-10자로 입력해주세요.")
    return
  }

  // 허용 문자 검사 (영문, 한글, 숫자, 특수문자 -_.)
  const nicknamePattern = /^[a-zA-Z가-힣0-9\-_.]+$/
  if (!nicknamePattern.test(nickname)) {
    alert("닉네임에는 영문, 한글, 숫자, 특수문자(-_.)만 사용 가능합니다.")
    return
  }

  console.log("[v0] Changing nickname to:", nickname)

  const res = await authFetch(`${API_BASE_URL}/nickname`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  })

  if (!res) return

  if (!res.ok) {
    const errorText = await res.text()
    alert(`닉네임 변경 실패: ${errorText || "이미 사용 중인 닉네임이거나 규칙에 맞지 않습니다."}`)
    return
  }

  // 204 No Content 성공
  alert("닉네임이 변경되었습니다.")
  closeModal("nicknameModal")
  loadMyPage() // 화면 새로고침
}

/* =====================
   비밀번호 변경
   ===================== */

function openPasswordModal() {
  // 입력 필드 초기화
  document.getElementById("currentPassword").value = ""
  document.getElementById("newPassword").value = ""
  document.getElementById("newPasswordConfirm").value = ""
  document.getElementById("passwordModal").classList.remove("hidden")
}

/**
 * PUT /password
 * 비밀번호 변경 API 호출
 * 규칙: 8-30자, 영문 대소문자/숫자 필수, 특수문자(.-_) 허용
 */
async function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const newPasswordConfirm = document.getElementById("newPasswordConfirm").value

  // 입력값 검증
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    alert("모든 필드를 입력해주세요.")
    return
  }

  if (newPassword !== newPasswordConfirm) {
    alert("새 비밀번호가 일치하지 않습니다.")
    return
  }

  // 비밀번호 규칙 검증
  if (newPassword.length < 8 || newPassword.length > 30) {
    alert("비밀번호는 8-30자로 입력해주세요.")
    return
  }

  // 영문 소문자, 대문자, 숫자 포함 검사
  const hasLowerCase = /[a-z]/.test(newPassword)
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const onlyAllowed = /^[a-zA-Z0-9.\-_]+$/.test(newPassword)

  if (!hasLowerCase || !hasUpperCase || !hasNumber) {
    alert("비밀번호는 영문 대소문자와 숫자를 모두 포함해야 합니다.")
    return
  }

  if (!onlyAllowed) {
    alert("비밀번호에는 영문, 숫자, 특수문자(.-_)만 사용 가능합니다.")
    return
  }

  console.log("[v0] Changing password")

  const res = await authFetch(`${API_BASE_URL}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      newPasswordConfirm,
    }),
  })

  if (!res) return

  if (!res.ok) {
    const errorText = await res.text()
    alert(`비밀번호 변경 실패: ${errorText || "현재 비밀번호가 일치하지 않거나 새 비밀번호가 규칙에 맞지 않습니다."}`)
    return
  }

  // 204 No Content 성공
  alert("비밀번호가 변경되었습니다.")
  closeModal("passwordModal")
}

/* =====================
   프로필 이미지 변경
   ===================== */

function openImageModal() {
  document.getElementById("imageInput").value = "" // 파일 입력 초기화
  document.getElementById("imageModal").classList.remove("hidden")
}

/**
 * PUT /profile-image
 * 프로필 이미지 업로드 (multipart/form-data)
 */
async function changeProfileImage() {
  const fileInput = document.getElementById("imageInput")
  const file = fileInput.files[0]

  if (!file) {
    alert("이미지 파일을 선택해주세요.")
    return
  }

  // 이미지 파일 타입 검증
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드 가능합니다.")
    return
  }

  console.log("[v0] Uploading profile image:", file.name)

  // FormData로 파일 전송
  const formData = new FormData()
  formData.append("file", file)

  const res = await authFetch(`${API_BASE_URL}/profile-image`, {
    method: "PUT",
    body: formData,
    // Content-Type은 자동으로 설정됨 (multipart/form-data)
  })

  if (!res) return

  if (!res.ok) {
    alert("프로필 이미지 업로드에 실패했습니다.")
    return
  }

  // 204 No Content 성공
  alert("프로필 이미지가 변경되었습니다.")
  closeModal("imageModal")

  // 이미지 미리보기 업데이트 (로컬)
  const reader = new FileReader()
  reader.onload = (e) => {
    document.getElementById("profileImage").src = e.target.result
  }
  reader.readAsDataURL(file)
}

/* =====================
   로그아웃
   ===================== */

function handleLogout() {
  document.getElementById("logoutModal").classList.remove("hidden")
}

/**
 * POST /sign-out
 * 로그아웃 API 호출
 */
async function confirmLogout() {
  console.log("[v0] Logging out")

  const res = await authFetch(`${API_BASE_URL}/sign-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: getRefreshToken(),
    }),
  })

  // 로그아웃은 실패해도 로컬 토큰 삭제
  if (res && res.ok) {
    console.log("[v0] Logout successful")
  }

  localStorage.clear()
  alert("로그아웃 되었습니다.")
  window.location.href = "login.html"
}

/* =====================
   회원탈퇴
   ===================== */

function openDeleteModal() {
  document.getElementById("deleteModal").classList.remove("hidden")
}

/**
 * DELETE /quit
 * 회원탈퇴 API 호출
 */
async function deleteAccount() {
  console.log("[v0] Deleting account")

  const res = await authFetch(`${API_BASE_URL}/quit`, {
    method: "DELETE",
  })

  if (!res) return

  if (!res.ok) {
    alert("회원탈퇴에 실패했습니다.")
    return
  }

  // 204 No Content 성공
  localStorage.clear()
  alert("회원탈퇴가 완료되었습니다.")
  window.location.href = "/"
}

/* =====================
   공통 모달 제어
   ===================== */

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden")
}

// 모달 외부 클릭 시 닫기
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.add("hidden")
  }
})
