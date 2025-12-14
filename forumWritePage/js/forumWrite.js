// 검색 기능
function search() {
    const searchInput = document.getElementById('searchInput').value;
    const filter = document.getElementById('filter').value;
    
    if (!searchInput.trim()) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    // 검색 결과 페이지로 이동
    window.location.href = `freeBoard.html?search=${encodeURIComponent(searchInput)}&filter=${filter}`;
}

// 게시글 작성
async function submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    // 유효성 검사
    if (!title) {
        alert('제목을 입력해주세요.');
        document.getElementById('postTitle').focus();
        return;
    }

    if (!content) {
        alert('내용을 입력해주세요.');
        document.getElementById('postContent').focus();
        return;
    }

    // 제목 길이 체크 (100자 제한)
    if (title.length > 100) {
        alert('제목은 100자 이내로 작성해주세요.');
        return;
    }

    try {
        // TODO: 실제 API 주소로 변경 필요
        // JWT 토큰도 헤더에 추가해야 함
        const response = await fetch('http://localhost:8080/forum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${토큰}`  // 로그인 시 받은 JWT 토큰
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            if (response.status === 400) {
                alert('입력 내용을 확인해주세요.');
                return;
            }
            throw new Error('게시글 작성 실패');
        }

        const data = await response.json();
        
        alert('게시글이 작성되었습니다!');
        
        // 작성된 게시글 상세 페이지로 이동
        window.location.href = `boardDetailPage.html?id=${data.id}`;

    } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert('게시글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// Enter 키 방지 (textarea는 제외)
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('postTitle');
    
    if (titleInput) {
        titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('postContent').focus();
            }
        });
    }
});