export function enableDragScroll(
  target,
  { multiplier = 1.2, clickThreshold = 5 } = {}
) {
  if (!target) return;

  let isDown = false;
  let startX = 0;
  let scrollX = 0;
  let moved = false;

  /* ───────── PC mouse ───────── */
  target.addEventListener("mousedown", (e) => {
    isDown = true;
    moved = false;
    startX = e.pageX;
    scrollX = target.scrollLeft;
    target.classList.add("dragging");
    document.body.style.userSelect = "none";
  });

  target.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > clickThreshold) moved = true;

    e.preventDefault(); // 기본 드래그 방지
    target.scrollLeft = scrollX - dx * multiplier;
  });

  /* mouseup / mouseleave */
  ["mouseup", "mouseleave"].forEach((type) =>
    target.addEventListener(type, (e) => {
      if (!isDown) return;
      isDown = false;
      target.classList.remove("dragging");
      document.body.style.userSelect = "";

      /* ① 드래그였다면 다음 click 한 번 무력화 */
      if (moved) {
        const cancel = (ev) => {
          ev.stopImmediatePropagation();
          ev.preventDefault();
          target.removeEventListener("click", cancel, true);
        };
        /* useCapture=true 로 한 번만 잡아서 취소 */
        target.addEventListener("click", cancel, true);
        return; // 끝
      }

      /* ② 클릭이었다면 여기서 수동 click 발행(선택) */
      const clickEvt = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
      });
      e.target.dispatchEvent(clickEvt);
    })
  );

  /* ───────── Mobile touch ───────── */
  let touchStartX = 0;
  target.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].pageX;
      scrollX = target.scrollLeft;
    },
    { passive: true }
  );

  target.addEventListener(
    "touchmove",
    (e) => {
      const dx = e.touches[0].pageX - touchStartX;
      target.scrollLeft = scrollX - dx * multiplier;
    },
    { passive: true }
  );
}

/* 자동 바인딩 */
export function autoBindDragScroll(selector = "[data-drag-scroll]") {
  document.querySelectorAll(selector).forEach((el) => enableDragScroll(el));
}
