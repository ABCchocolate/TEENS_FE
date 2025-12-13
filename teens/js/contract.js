const phone = document.getElementById("phone");

phone.addEventListener("input", (e) => {
    // 스페이스 → 하이픈으로 자동 변환
    let value = e.target.value.replace(/\s+/g, "-");

    // 숫자만 남기기
    value = value.replace(/[^0-9]/g, "");

    // 하이픈 자동 삽입
    if (value.length <= 3) {
        value = value;
    } else if (value.length <= 7) {
        value = value.slice(0,3) + "-" + value.slice(3);
    } else {
        value = value.slice(0,3) + "-" + value.slice(3,7) + "-" + value.slice(7,11);
    }

    e.target.value = value;
});
