(() => {
  "use strict";
  const Blog = window.KianBlog;
  const label = { markdown: "Markdown", text: "Text", html: "Web article", pdf: "PDF", image: "Image", audio: "Audio", video: "Video", code: "Text / code" };
  const format = post => label[post.kind] || (post.extension ? post.extension.toUpperCase() : "File");
  const dateLabel = value => value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value + "T12:00:00Z")) : "";
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  const list = document.querySelector("#blog-list");
  if (list) {
    const status = document.querySelector("#blog-status");
    const search = document.querySelector("#blog-search");
    let posts = [];
    function render() {
      const query = search.value.toLowerCase().trim();
      const selected = posts.filter(post => `${post.title} ${post.extension}`.toLowerCase().includes(query));
      list.replaceChildren();
      selected.forEach(post => {
        const article = element("article", "blog-entry");
        const meta = element("p", "blog-meta");
        if (post.date) meta.append(element("time", "", dateLabel(post.date)));
        meta.append(element("span", "blog-format", format(post)));
        const heading = element("h3");
        const link = element("a", "", post.title);
        link.href = post.reader;
        const arrow = element("span", "blog-arrow", "↗");
        arrow.setAttribute("aria-hidden", "true");
        link.append(arrow);
        heading.append(link);
        article.append(meta, heading);
        list.append(article);
      });
      status.textContent = selected.length ? "" : posts.length ? "No posts match that search." : "No posts published yet.";
    }
    search.addEventListener("input", render);
    let started = false;
    async function load() {
      if (started) return;
      started = true;
      let storage;
      try { storage = localStorage; } catch { storage = null; }
      const result = await Blog.loadPosts({ hostname: location.hostname, fetcher: fetchWithTimeout, storage });
      posts = result.posts;
      search.hidden = !posts.length;
      render();
      if (result.unavailable) {
        status.textContent = "Posts are taking a little longer to load. ";
        const fallback = element("a", "", "Browse posts on GitHub ↗");
        fallback.href = `https://github.com/${Blog.config.owner}/${Blog.config.repository}/tree/${Blog.config.branch}/${Blog.config.folder}`;
        fallback.target = "_blank"; fallback.rel = "noopener noreferrer";
        status.append(fallback);
      }
    }
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
      }, { rootMargin: "300px" });
      observer.observe(document.querySelector("#blog"));
    } else load();
  }

  const reader = document.querySelector("#post-content");
  if (!reader) return;
  const title = document.querySelector("#post-title");
  const meta = document.querySelector("#post-meta");
  const status = document.querySelector("#post-status");
  const original = document.querySelector("#post-original");
  const filename = new URLSearchParams(location.search).get("file");
  const post = Blog.makePost(filename);
  function setHeading(text, date) {
    title.textContent = text;
    document.title = `${text} — Kian Sahafi`;
    meta.textContent = [dateLabel(date), post ? format(post) : ""].filter(Boolean).join(" · ");
  }
  function showAttachment() {
    const box = element("div", "post-attachment");
    box.append(element("p", "", "This post is a document. Open or download the file to read it."));
    const link = element("a", "button", "Open the file ↗");
    link.href = post.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    box.append(link); reader.append(box);
  }
  if (!post) {
    setHeading("Post not found");
    status.textContent = "Choose a post from the blog to start reading.";
    return;
  }
  setHeading(post.title, post.date);
  original.href = post.url;
  original.hidden = false;
  original.setAttribute("download", post.file);

  async function read() {
    if (["markdown", "text", "code"].includes(post.kind)) {
      const response = await fetchWithTimeout(post.url);
      if (!response.ok) throw new Error("Post unavailable");
      const bytes = Number(response.headers.get("content-length") || 0);
      if (bytes > 3 * 1024 * 1024) { showAttachment(); return; }
      const source = await response.text();
      if (source.length > 3 * 1024 * 1024) { showAttachment(); return; }
      const parsed = post.kind === "code" ? { body: source, title: post.title, date: post.date } : Blog.parseText(source, post.file);
      setHeading(parsed.title, parsed.date);
      if (post.kind === "markdown" && window.marked && window.DOMPurify?.isSupported) {
        reader.innerHTML = DOMPurify.sanitize(marked.parse(parsed.body), {
          USE_PROFILES: { html: true }, FORBID_TAGS: ["style", "form", "input", "iframe", "object", "embed"]
        });
        const firstHeading = reader.querySelector("h1");
        if (firstHeading?.textContent.trim() === parsed.title.trim()) firstHeading.remove();
        reader.querySelectorAll("a[href], img[src]").forEach(node => {
          const attribute = node.tagName === "IMG" ? "src" : "href";
          const value = node.getAttribute(attribute);
          if (!value || value.startsWith("#")) return;
          const resolved = new URL(value, new URL(post.url, location.href));
          if (["http:", "https:", "mailto:"].includes(resolved.protocol)) node.setAttribute(attribute, resolved.href);
          if (node.tagName === "A" && resolved.origin !== location.origin) { node.target = "_blank"; node.rel = "noopener noreferrer"; }
          if (node.tagName === "IMG") node.loading = "lazy";
        });
      } else {
        const text = element("pre", post.kind === "code" ? "post-code" : "post-plain", parsed.body);
        reader.append(text);
      }
    } else if (post.kind === "html") {
      const frame = element("iframe", "post-frame");
      frame.src = post.url; frame.title = post.title; frame.setAttribute("sandbox", "");
      reader.append(frame);
    } else if (post.kind === "pdf") {
      const object = element("object", "post-frame");
      object.data = post.url; object.type = "application/pdf"; object.setAttribute("aria-label", post.title);
      const link = element("a", "", "Open the PDF ↗"); link.href = post.url; object.append(link);
      reader.append(object);
    } else if (post.kind === "image") {
      const image = element("img", "post-image"); image.src = post.url; image.alt = post.title; reader.append(image);
    } else if (["audio", "video"].includes(post.kind)) {
      const media = element(post.kind, "post-media"); media.src = post.url; media.controls = true; media.preload = "metadata";
      if (post.kind === "video") media.playsInline = true;
      reader.append(media);
    } else showAttachment();
  }
  read().then(() => { status.textContent = ""; }).catch(() => {
    status.textContent = "This post couldn’t be loaded. Try refreshing, or open the original file below.";
    const link = element("a", "post-retry-link", "Open the original file ↗");
    link.href = post.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    reader.append(link);
  });
})();
