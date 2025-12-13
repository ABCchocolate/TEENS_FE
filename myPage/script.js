// 사용자 데이터 (실제로는 서버에서 받아올 데이터)
let userData = {
    username: 'MAREMARE',
    userId: '@maremare',
    email: 'mare2mare6@gmail.com',
    profileImage: './TEENSuser.png',
    postCount: 0,
    commentCount: 0
};

// 페이지 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
});

// 사용자 데이터 로드
function loadUserData() {
    // 실제로는 서버에서 데이터를 받아옵니다.
    // fetch('/api/user/profile')
    //     .then(response => response.json())
    //     .then(data => {
    //         userData = data;
    //         updateUI();
    //     })
    
    // 현재는 로컬 데이터 사용
    updateUI();
}

// UI 업데이트
function updateUI() {
    document.getElementById('displayName').textContent = userData.username;
    document.getElementById('displayUserId').textContent = userData.userId;
    document.getElementById('emailValue').textContent = userData.email;
    document.getElementById('postCount').textContent = userData.postCount;
    document.getElementById('commentCount').textContent = userData.commentCount;
    
    if (userData.profileImage) {
        document.getElementById('profileImage').src = userData.profileImage;
    }
}

// 모달 열기
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// 사용자이름 변경 핸들러
function handleEditUsername() {
    const input = document.getElementById('usernameInput');
    input.value = userData.username;
    openModal('editUsernameModal');
}

function confirmEditUsername() {
    const newUsername = document.getElementById('usernameInput').value.trim();
    if (!newUsername) {
        alert('사용자이름을 입력해주세요.');
        return;
    }
    
    // 서버에 요청
    // fetch('/api/user/username', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username: newUsername })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     userData.username = newUsername;
    //     updateUI();
    //     closeModal('editUsernameModal');
    // })
    
    userData.username = newUsername;
    updateUI();
    closeModal('editUsernameModal');
}

// 비밀번호 변경 핸들러
function handleEditPassword() {
    openModal('editPasswordModal');
}

function confirmEditPassword() {
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 서버에 요청
    // fetch('/api/user/password', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //         currentPassword: currentPassword,
    //         newPassword: newPassword 
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     closeModal('editPasswordModal');
    //     document.getElementById('currentPasswordInput').value = '';
    //     document.getElementById('newPasswordInput').value = '';
    //     document.getElementById('confirmPasswordInput').value = '';
    //     alert('비밀번호가 변경되었습니다.');
    // })
    
    closeModal('editPasswordModal');
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    alert('비밀번호가 변경되었습니다.');
}

// 프로필 이미지 변경 핸들러
function handleProfileImageChange() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // 서버에 업로드
                // const formData = new FormData();
                // formData.append('image', file);
                // fetch('/api/user/profile-image', {
                //     method: 'POST',
                //     body: formData
                // })
                // .then(response => response.json())
                // .then(data => {
                //     userData.profileImage = data.imageUrl;
                //     updateUI();
                // })
                
                userData.profileImage = event.target.result;
                updateUI();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// 로그아웃 핸들러
function handleLogout() {
    openModal('logoutModal');
}

function confirmLogout() {
    // 서버에 로그아웃 요청
    // fetch('/api/auth/logout', { method: 'POST' })
    // .then(() => {
    //     window.location.href = '/login';
    // })
    
    closeModal('logoutModal');
    console.log('로그아웃 처리');
    alert('로그아웃 되었습니다.');
    // window.location.href = '/login';
}

// 회원탈퇴 핸들러
function handleAccountDeletion() {
    openModal('deleteAccountModal');
}

function confirmDeleteAccount() {
    // 서버에 탈퇴 요청
    // fetch('/api/user/delete', { method: 'DELETE' })
    // .then(() => {
    //     window.location.href = '/';
    // })
    
    closeModal('deleteAccountModal');
    console.log('회원탈퇴 처리');
    alert('계정이 삭제되었습니다.');
    // window.location.href = '/';
}