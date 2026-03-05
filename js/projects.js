/* ============================
   Coverflow Carousel + Click to Detail
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
    const cards = Array.from(document.querySelectorAll(".project-card"));
    const dotsContainer = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");

    if (!cards.length) return;

    let current = 0;

    // dot 생성
    cards.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", `프로젝트 ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        if (dotsContainer) dotsContainer.appendChild(dot);
    });

    function updateClasses() {
        const dots = dotsContainer ? dotsContainer.querySelectorAll(".carousel-dot") : [];
        cards.forEach((card, i) => {
            card.classList.remove("is-active", "is-prev", "is-next", "is-prev2", "is-next2");
            const diff = i - current;
            if (diff === 0) card.classList.add("is-active");
            else if (diff === -1) card.classList.add("is-prev");
            else if (diff === 1) card.classList.add("is-next");
            else if (diff === -2) card.classList.add("is-prev2");
            else if (diff === 2) card.classList.add("is-next2");
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, cards.length - 1));
        updateClasses();
    }

    // 버튼 클릭
    if (prevBtn) prevBtn.addEventListener("click", () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(current + 1));

    // 카드 클릭 → 중앙이면 detail 이동, 아니면 해당 카드로 이동
    cards.forEach((card, i) => {
        card.addEventListener("click", () => {
            if (i !== current) {
                goTo(i);
                return;
            }
            // 중앙 카드 클릭 → detail 섹션으로 스크롤
            const id = card.getAttribute("data-id");
            const target = document.getElementById(`p-detail-${id}`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });

    // 키보드 지원
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") goTo(current - 1);
        if (e.key === "ArrowRight") goTo(current + 1);
    });

    // 초기 설정
    updateClasses();
});
