(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const button = document.querySelector(".theme-toggle");
  const key = "kian-cv-theme-v1";
  function setTheme(theme) {
    const dark = theme !== "light";
    root.dataset.theme = dark ? "dark" : "light";
    button?.setAttribute("aria-pressed", String(dark));
    button?.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#111113" : "#f5f3ed";
  }
  try { setTheme(localStorage.getItem(key) || "dark"); } catch { setTheme("dark"); }
  button?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem(key, next); } catch { /* Optional preference. */ }
  });
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
