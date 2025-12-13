document.addEventListener("DOMContentLoaded", () => {
//tiny input
    document.querySelectorAll(".tiny-input").forEach((el) => {
        el.addEventListener("input", () => {
            el.value = el.value.replace(/[^0-9]/g, "");
            el.style.textAlign = "center";

            if (el.classList.contains("year-input")) {
                el.value = el.value.slice(0, 4);
            } else {
                el.value = el.value.slice(0, 2);
            }
        });
    });

// 전화번호 하이픈
    document.querySelectorAll(".phone").forEach((phone) => {
        phone.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value.length <= 3) {
                // 010
            } else if (value.length <= 7) {
                value = value.slice(0, 3) + "-" + value.slice(3);
            } else {
                value =
                value.slice(0, 3) +
                "-" +
                value.slice(3, 7) +
                "-" +
                value.slice(7, 11);
            }

            e.target.value = value;
        });
    });

//상여금 단일선택
    const bonusYes = document.getElementById("bonus-yes");
    const bonusNo = document.getElementById("bonus-no");

    if (bonusYes && bonusNo) {
        bonusYes.addEventListener("change", () => {
            if (bonusYes.checked) bonusNo.checked = false;
        });

        bonusNo.addEventListener("change", () => {
            if (bonusNo.checked) bonusYes.checked = false;
        });
    }

// 필수입력
    const requiredInputs = document.querySelectorAll(
        ".contract-paper input[type='text'], .contract-paper input[type='number'], .contract-paper input[type='tel']"
    );

    const insuranceChecks = document.querySelectorAll("input[name='insure']");
    const pureRequired = [...requiredInputs].filter(input =>
        !Array.from(insuranceChecks).includes(input) &&
        !input.classList.contains("optional-pay")
    );

    const pdfBtn = document.getElementById("pdfBtn");
    const saveBtn = document.getElementById("saveBtn");
    const warnMsg = document.getElementById("warn-msg");

    function isFilled() {
        for (let input of pureRequired) {
            if (input.value.trim() === "") return false;
        }
        return true;
    }

    function handleClick(e) {
        e.preventDefault();

        if (!isFilled()) {
            warnMsg.style.display = "block";
            warnMsg.textContent = "* 필수 항목을 모두 입력해주세요.";
            return;
        }

        warnMsg.style.display = "none";
        generatePDF();
    }

    pdfBtn.addEventListener("click", handleClick);
    saveBtn.addEventListener("click", handleClick);
});


//pdf
async function generatePDF() {

    const contractPaper = document.querySelector(".contract-paper");
    const container = document.querySelector(".main-content");

    if (!contractPaper) return;

    const originalTransform = container.style.transform;
    container.style.transform = "none";

    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    let checkboxBackup = [];

    checkboxes.forEach((box, i) => {
        checkboxBackup[i] = {
            checked: box.checked,
            display: box.style.display
        };

        box.style.display = "none";

        const mark = document.createElement("span");
        mark.classList.add("pdf-checkmark");
        mark.textContent = box.checked ? "〇" : " ";
        box.insertAdjacentElement("afterend", mark);
    });

    const inputs = document.querySelectorAll(
        ".contract-paper input[type='text'], .contract-paper input[type='number'], .contract-paper input[type='tel']"
    );

    let inputBorderBackup = [];

    inputs.forEach((el, i) => {
        inputBorderBackup[i] = el.style.borderBottom;
        el.style.borderBottom = "none";
    });

    const canvas = await html2canvas(contractPaper, {
        scale: 2,
        useCORS: true,
        allowTaint: true
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
    }

    pdf.save("근로계약서.pdf");

    document.querySelectorAll(".pdf-checkmark").forEach(m => m.remove());

    checkboxes.forEach((box, i) => {
        box.style.display = checkboxBackup[i].display;
        box.checked = checkboxBackup[i].checked;
    });

    inputs.forEach((el, i) => {
        el.style.borderBottom = inputBorderBackup[i];
    });

    container.style.transform = originalTransform;
}


const contractPage = document.querySelector(".page-contract");
const guidePage = document.querySelector(".page-guide");

document.getElementById("goGuide").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    
    contractPage.style.transform = "translateX(-100%)"; // 왼쪽으로 밀려남
    guidePage.style.transform = "translateX(0)";        // 오른쪽 → 화면 안으로
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    
    contractPage.style.transform = "translateX(0)";
    guidePage.style.transform = "translateX(100%)"; // 다시 오른쪽으로 빠져나감
});
