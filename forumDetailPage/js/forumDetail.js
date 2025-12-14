const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 게시글 데이터 로드
async function loadPost() {
    try {
        // 테스트용 (백엔드 API 대신)
        const response = await fetch('./testPost.json');
        
        // 실제 사용 (백엔드 API)
        // const response = await fetch(`http://localhost:8080/forum/${postId}`);

        if (!response.ok) {
            throw new Error('게시글 로드 실패');
        }

        const allPosts = await response.json();  // 전체 게시글 배열
        
        // postId에 맞는 게시글 찾기
        const data = allPosts.find(post => post.id == postId);
        
        if (!data) {
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = 'freeBoard.html';
            return;
        }

        // 화면에 데이터 표시
        document.getElementById('postTitle').textContent = data.title;
        document.getElementById('authorName').textContent = data.username;
        
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

        // 댓글 렌더링
        renderComments(data.comments);

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        
        // 에러 시 기본 메시지 표시
        document.getElementById('postTitle').textContent = '게시글을 불러올 수 없습니다.';
        document.getElementById('postContent').innerHTML = '<p style="text-align: center; color: #ef4444;">게시글을 불러오는데 실패했습니다.</p>';
        document.getElementById('commentList').innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">댓글을 불러올 수 없습니다.</p>';
    }
}

// 댓글 렌더링
function renderComments(comments) {
    const commentList = document.getElementById('commentList');
    
    if (!comments || comments.length === 0) {
        commentList.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">첫 댓글을 작성해보세요!</p>';
        return;
    }

    commentList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar"></div>
            <div class="comment-content">
                <div class="comment-author">${comment.nickname}</div>
                <div class="comment-text">${comment.content}</div>
            </div>
        </div>
    `).join('');
}

// 댓글 작성
async function submitComment() {
    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();

    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        // TODO: 실제 API 주소로 변경 필요
        // JWT 토큰도 헤더에 추가해야 함
        const response = await fetch(`http://localhost:8080/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${토큰}`  // 로그인 시 받은 JWT 토큰
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('로그인이 필요합니다.');
                return;
            }
            throw new Error('댓글 작성 실패');
        }

        alert('댓글이 작성되었습니다!');
        commentInput.value = '';
        
        // 댓글 목록 다시 로드
        loadPost();

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        alert('댓글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// Enter 키로 댓글 작성
document.addEventListener('DOMContentLoaded', () => {
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitComment();
            }
        });
    }
});

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

// 목록으로 돌아가기
function goBack() {
    window.location.href = 'freeBoard.html';
}

// 페이지 로드 시 게시글 데이터 가져오기
if (postId) {
    loadPost();
} else {
    alert('잘못된 접근입니다.');
    window.location.href = 'freeBoard.html';
}