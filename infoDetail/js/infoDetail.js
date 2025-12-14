const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 게시글 데이터 로드
async function loadPost() {
    try {
        // 테스트용 (백엔드 API 대신)
        const response = await fetch('./testInfo.json');
        
        // 실제 사용 (백엔드 API)
        // const response = await fetch(`http://localhost:8080/information/${postId}`);

        if (!response.ok) {
            throw new Error('게시글 로드 실패');
        }

        const allPosts = await response.json();  // 전체 게시글 배열
        
        // postId에 맞는 게시글 찾기
        const data = allPosts.find(post => post.id == postId);
        
        if (!data) {
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = 'infoList.html';
            return;
        }

        // 화면에 데이터 표시
        document.getElementById('postTitle').textContent = data.title;
        document.getElementById('authorName').textContent = data.username || data.nickname;
        
        // 날짜 형식 변환 (2024-12-25T10:30:00 -> 2024.12.25)
        const date = new Date(data.createdAt);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        document.getElementById('postDate').textContent = formattedDate;
        
        // 본문 내용 (줄바꿈 처리)
        const contentElement = document.getElementById('postContent');
        contentElement.innerHTML = data.content
            .split('\n')
            .map(line => line ? `<p>${line}</p>` : '<br>')
            .join('');

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        
        // 에러 시 기본 메시지 표시
        document.getElementById('postTitle').textContent = '게시글을 불러올 수 없습니다.';
        document.getElementById('postContent').innerHTML = '<p style="text-align: center; color: #ef4444;">게시글을 불러오는데 실패했습니다.</p>';
    }
}

// 검색 기능
function search() {
    const searchInput = document.getElementById('searchInput').value;
    const filter = document.getElementById('filter').value;
    
    if (!searchInput.trim()) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    // 검색 결과 페이지로 이동
    window.location.href = `infoList.html?search=${encodeURIComponent(searchInput)}&filter=${filter}`;
}

// 목록으로 돌아가기
function goBack() {
    window.location.href = 'infoList.html';
}

// 페이지 로드 시 게시글 데이터 가져오기
if (postId) {
    loadPost();
} else {
    alert('잘못된 접근입니다.');
    window.location.href = 'infoList.html';
}