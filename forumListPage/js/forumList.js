let currentPage = 1;
let totalPages = 1;
const postsPerPage = 10;
let allPosts = []; 
let filteredPosts = []; 

// 게시글 목록 불러오기
async function loadPosts() {
    try {
        // 테스트용 (백엔드 API 대신)
        const response = await fetch('./testPosts.json');
        
        // 실제 사용 (백엔드 API)
        // const response = await fetch('http://localhost:8080/forum');
        
        if (!response.ok) {
            throw new Error('게시글 목록 로드 실패');
        }
        
        const data = await response.json();
        allPosts = data;
        filteredPosts = [...allPosts]; 
        
        updatePagination();
        renderBoard();
        renderPagination();
        
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 페이지 수 계산
function updatePagination() {
    totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (totalPages === 0) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;
}

// 게시판 렌더링
function renderBoard() {
    const boardContent = document.getElementById('boardContent');
    const startIdx = (currentPage - 1) * postsPerPage;
    const endIdx = startIdx + postsPerPage;
    const currentPosts = filteredPosts.slice(startIdx, endIdx);
    
    if (currentPosts.length === 0) {
        boardContent.innerHTML = '<p style="text-align: center; padding: 40px; color: #9ca3af;">게시글이 없습니다.</p>';
        return;
    }
    
    boardContent.innerHTML = currentPosts.map(post => {
        // 날짜 형식 변환 
        const date = new Date(post.createdAt);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        
        return `
            <div class="board-row" onclick="viewPost(${post.id})">
                <div>${post.id}</div>
                <div>${post.title}</div>
                <div>${post.nickname}</div>
                <div>${formattedDate}</div>
            </div>
        `;
    }).join('');
}

// 페이지네이션 렌더링
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    
    let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
    
    pagination.innerHTML = html;
}

// 페이지 변경
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderBoard();
    renderPagination();
    
    // 페이지 이동 시 스크롤 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 검색 및 필터링
function search() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const filterType = document.getElementById('filter').value;
    
    if (!searchInput) {
        // 검색어 없으면 전체 표시
        filteredPosts = [...allPosts];
    } else {
        // 필터 타입에 따라 검색
        filteredPosts = allPosts.filter(post => {
            const searchLower = searchInput.toLowerCase();
            
            switch(filterType) {
                case 'title':
                    return post.title.toLowerCase().includes(searchLower);
                case 'author':
                    return post.nickname.toLowerCase().includes(searchLower);
                case 'content':
                    return post.content && post.content.toLowerCase().includes(searchLower);
                case 'all':
                default:
                    // 제목 + 내용에서 검색
                    return post.title.toLowerCase().includes(searchLower) || 
                           (post.content && post.content.toLowerCase().includes(searchLower));
            }
        });
    }
    
    // 검색 결과에 따라 페이지 재설정
    currentPage = 1;
    updatePagination();
    renderBoard();
    renderPagination();
    
    // 검색 결과 안내
    if (searchInput) {
        const resultCount = filteredPosts.length;
        if (resultCount === 0) {
            alert('검색 결과가 없습니다.');
        }
    }
}

// Enter 키로 검색
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                search();
            }
        });
    }
});

// 게시글 상세보기
function viewPost(id) {
    window.location.href = `../forumDetailPage/forumDetail.html?id=${id}`;
}

// 글 작성
function writePost() {
    //아직안함 
    //Todo : 글 작성 페이지 만들기 썅
    alert('글 작성 페이지로 이동');
}

// 페이지 로드 시 게시글 목록 가져오기
loadPosts();