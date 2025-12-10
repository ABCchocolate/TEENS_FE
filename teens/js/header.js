document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    let lastScrollY = 0;

    window.addEventListener("scroll", () => {
        if (window.scrollY > lastScrollY) {
            header.classList.add("hide");
        } else {
            header.classList.remove("hide");
        }
        lastScrollY = window.scrollY;
    });
});
