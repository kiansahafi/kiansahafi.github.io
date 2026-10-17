(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Follow the current CV section without hiding any of its content.
  const sectionLinks = [...document.querySelectorAll(".cv-sidebar a")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!current) return;
      sectionLinks.forEach(link => {
        if (link.hash === `#${current.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-5% 0px -65% 0px", threshold: 0 });
    document.querySelectorAll(".resume-section").forEach(section => observer.observe(section));
  }

  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector(".copy-status");
  let statusTimer;
  copyButton.addEventListener("click", async () => {
    clearTimeout(statusTimer);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText("kiansahafi1@gmail.com");
      copyStatus.textContent = "Copied. See you in the inbox!";
    } catch {
      copyStatus.textContent = "Select the email address above to copy it, or click it to write.";
    }
    statusTimer = setTimeout(() => { copyStatus.textContent = ""; }, 6000);
  });

  // The little network moves around the pointer. Content never depends on it.
  const area = document.querySelector(".portrait-area");
  const portrait = document.querySelector(".portrait-card");
  const svg = document.querySelector(".sketch");
  const path = svg.querySelector("path");
  const circles = [...svg.querySelectorAll("circle")];
  const original = circles.map(c => ({ x: Number(c.getAttribute("cx")), y: Number(c.getAttribute("cy")) }));
  let points = original.map(p => ({ ...p }));
  let bases = original.map(p => ({ ...p }));
  const edges = [[0,1],[1,2],[2,3],[1,4],[4,2],[2,5],[0,6],[6,4],[4,7],[7,5],[5,8],[6,9],[9,10],[10,7],[7,11],[11,8],[4,5]];
  let pointer = null;
  let frame = null;
  let tiltX = 0;
  let tiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;

  function draw() {
    points.forEach((p, i) => {
      circles[i].setAttribute("cx", p.x.toFixed(2));
      circles[i].setAttribute("cy", p.y.toFixed(2));
    });
    path.setAttribute("d", edges.map(([a,b]) => `M${points[a].x.toFixed(2)} ${points[a].y.toFixed(2)}L${points[b].x.toFixed(2)} ${points[b].y.toFixed(2)}`).join(""));
    portrait.style.transform = `rotate(5deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  }
  function tick() {
    frame = null;
    let unsettled = false;
    points.forEach((p, i) => {
      let tx = bases[i].x;
      let ty = bases[i].y;
      if (pointer && !reducedMotion.matches) {
        const dx = tx - pointer.x;
        const dy = ty - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 190 && distance > 0) {
          const push = (1 - distance / 190) * 32;
          tx += dx / distance * push;
          ty += dy / distance * push;
        }
      }
      if (Math.abs(p.x - tx) + Math.abs(p.y - ty) > .06) unsettled = true;
      p.x += (tx - p.x) * .12;
      p.y += (ty - p.y) * .12;
    });
    if (Math.abs(tiltX - targetTiltX) + Math.abs(tiltY - targetTiltY) > .015) unsettled = true;
    tiltX += (targetTiltX - tiltX) * .12;
    tiltY += (targetTiltY - tiltY) * .12;
    draw();
    if (unsettled) schedule();
  }
  function schedule() { if (frame === null) frame = requestAnimationFrame(tick); }
  area.addEventListener("pointermove", event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const box = area.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    pointer = { x: x * 460, y: y * 460 };
    targetTiltX = (0.5 - y) * 7;
    targetTiltY = (x - 0.5) * 7;
    schedule();
  }, { passive: true });
  area.addEventListener("pointerleave", () => {
    pointer = null;
    targetTiltX = targetTiltY = 0;
    schedule();
  });
  document.querySelector(".sketch-shuffle").addEventListener("click", () => {
    bases = original.map(p => ({ x: Math.max(14, Math.min(446, p.x + (Math.random() - .5) * 55)), y: Math.max(14, Math.min(446, p.y + (Math.random() - .5) * 55)) }));
    if (reducedMotion.matches) {
      points = bases.map(p => ({ ...p }));
      tiltX = tiltY = targetTiltX = targetTiltY = 0;
      draw();
    } else schedule();
  });
  reducedMotion.addEventListener("change", () => {
    pointer = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    points = bases.map(p => ({ ...p }));
    tiltX = tiltY = targetTiltX = targetTiltY = 0;
    draw();
  });
})();
