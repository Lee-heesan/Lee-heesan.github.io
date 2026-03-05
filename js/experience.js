/* ============================
   Experience Section Horizontal Scroll
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("experience");
    const track = section?.querySelector(".exp-list");
    const cards = track ? Array.from(track.querySelectorAll(".exp-item")) : [];

    if (!section || !track || cards.length === 0) return;

    let current = 0;
    let animating = false;
    let lockedInSection = false;
    let lockEntryTime = null;

    const clamp = val => Math.max(0, Math.min(cards.length - 1, val));

    const updatePosition = () => {
        if (window.innerWidth < 960) {
            track.style.transform = "none";
            cards.forEach(card => card.classList.add("active"));
            return;
        }

        const gap = parseFloat(getComputedStyle(track).getPropertyValue("gap")) || 0;
        const cardWidth = cards[0].offsetWidth;
        const parentLeft = track.parentElement.getBoundingClientRect().left;
        const viewportCenter = window.innerWidth / 2;
        const cardOffset = current * (cardWidth + gap) + cardWidth / 2;
        const translateX = viewportCenter - parentLeft - cardOffset;
        track.style.transform = `translateX(${translateX}px)`;

        cards.forEach((card, idx) => {
            card.classList.toggle("active", idx === current);
        });
    };

    const move = direction => {
        const next = clamp(current + direction);
        if (next === current) return false;
        current = next;
        updatePosition();
        return true;
    };

    const isSectionVisible = () => {
        const rect = section.getBoundingClientRect();
        const centerY = window.innerHeight / 2;
        return rect.top < centerY && rect.bottom > centerY;
    };

    const onWheel = e => {
        if (window.innerWidth < 960) return;

        const delta = e.deltaY || e.deltaX;
        if (Math.abs(delta) < 3) return;
        const dir = delta > 0 ? 1 : -1;

        if (isSectionVisible()) {
            if (!lockedInSection) {
                lockedInSection = true;
                lockEntryTime = Date.now();
            }
        } else {
            lockedInSection = false;
            lockEntryTime = null;
        }

        if (!lockedInSection) return;

        const timeSinceLock = Date.now() - lockEntryTime;
        if (timeSinceLock < 200) {
            e.preventDefault();
            return;
        }

        if ((current === 0 && dir < 0) || (current === cards.length - 1 && dir > 0)) {
            lockedInSection = false;
            lockEntryTime = null;
            return;
        }

        e.preventDefault();
        if (animating) return;

        const moved = move(dir);
        if (moved) {
            animating = true;
            setTimeout(() => { animating = false; }, 450);
        }
    };

    const onResize = () => {
        current = clamp(current);
        updatePosition();
    };

    updatePosition();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
});
