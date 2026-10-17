(function (scope, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else scope.KianBlog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const config = Object.freeze({ owner: "kiansahafi", repository: "kiansahafi.github.io", branch: "main", folder: "posts", liveHost: "kiansahafi.github.io" });
  const cacheKey = "kian-blog-catalog-v1";
  const groups = {
    markdown: ["md", "markdown"], text: ["txt", "text"], html: ["html", "htm"], pdf: ["pdf"],
    image: ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"],
    audio: ["mp3", "wav", "ogg", "m4a", "flac"], video: ["mp4", "webm", "mov"],
    code: ["json", "yaml", "yml", "csv", "tsv", "xml", "tex", "py", "js", "ts", "css", "sql", "sh", "rs", "java", "c", "cpp", "rst", "adoc", "log"]
  };
  function isPublicFile(name) {
    return typeof name === "string" && name.length > 0 && name.length <= 255 &&
      !/^[._]/.test(name) && !/[\\/\x00-\x1f\x7f]/.test(name) && !/^readme(?:\.[^.]+)?$/i.test(name);
  }
  function extension(name) { const dot = name.lastIndexOf("."); return dot > 0 ? name.slice(dot + 1).toLowerCase() : ""; }
  function kind(name) { const ext = extension(name); return Object.keys(groups).find(group => groups[group].includes(ext)) || "attachment"; }
  function validDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value + "T12:00:00Z")) && new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value;
  }
  function makePost(name) {
    if (!isPublicFile(name)) return null;
    const ext = extension(name);
    let title = ext ? name.slice(0, -(ext.length + 1)) : name;
    const dated = title.match(/^(\d{4}-\d{2}-\d{2})[-_ ]+(.*)$/);
    const date = dated && validDate(dated[1]) ? dated[1] : null;
    if (dated) title = dated[2];
    title = title.replace(/[-_]+/g, " ").trim() || name;
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return { file: name, title, date, extension: ext, kind: kind(name), url: `${config.folder}/${encodeURIComponent(name)}`, reader: `post.html?file=${encodeURIComponent(name)}` };
  }
  function normalizeFiles(files) {
    const seen = new Set();
    return files.filter(item => item && (!item.type || item.type === "file"))
      .map(item => makePost(typeof item === "string" ? item : item.name || item.file))
      .filter(item => item && !seen.has(item.file) && seen.add(item.file))
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title));
  }
  function parseText(text, filename) {
    let body = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const metadata = {};
    const front = body.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (front) {
      front[1].split("\n").forEach(line => {
        const pair = line.match(/^(title|date|summary|description):\s*(.*?)\s*$/);
        if (pair) metadata[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/, "$2");
      });
      if (Object.keys(metadata).length) body = body.slice(front[0].length);
    }
    const fallback = makePost(filename);
    const heading = kind(filename) === "markdown" ? body.match(/^#\s+(.+?)\s*#*$/m) : null;
    return { body, title: metadata.title || heading?.[1] || fallback?.title || "Post", date: validDate(metadata.date) ? metadata.date : fallback?.date || null, summary: metadata.summary || metadata.description || "" };
  }
  async function loadPosts({ hostname = "", fetcher = globalThis.fetch, storage = null } = {}) {
    let unavailable = false;
    if (hostname === config.liveHost) {
      try {
        const url = `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${config.folder}?ref=${encodeURIComponent(config.branch)}`;
        const response = await fetcher(url, { headers: { Accept: "application/vnd.github+json" } });
        if (!response.ok) {
          if (response.status !== 404) throw new Error("Post directory unavailable");
        } else {
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error("Invalid post directory");
          const posts = normalizeFiles(data);
          try { storage?.setItem(cacheKey, JSON.stringify(posts.map(post => post.file))); } catch { /* Optional cache. */ }
          return { posts, source: "github", unavailable: false };
        }
      } catch {
        unavailable = true;
        try {
          const saved = JSON.parse(storage?.getItem(cacheKey) || "null");
          if (Array.isArray(saved) && saved.length) return { posts: normalizeFiles(saved), source: "cache", unavailable: false };
        } catch { /* Try the bundled snapshot. */ }
      }
    }
    try {
      const response = await fetcher(`${config.folder}/_index.json`);
      if (!response.ok) throw new Error("Snapshot unavailable");
      const files = await response.json();
      const posts = normalizeFiles(Array.isArray(files) ? files : []);
      return { posts, source: "snapshot", unavailable: unavailable && !posts.length };
    } catch { return { posts: [], source: "unavailable", unavailable: true }; }
  }
  return { config, isPublicFile, extension, kind, validDate, makePost, normalizeFiles, parseText, loadPosts };
});
