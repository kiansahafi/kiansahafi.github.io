# Kian Sahafi — personal website

A static, build-free portfolio with clear CV sections and a file-based blog. The deployable website is in `dist/`. The default theme is black, with an optional light theme. All CV entries are visible directly on the page.

## Publish a blog post

After uploading this website, add your post file directly to `posts/` in the GitHub repository and commit it to `main`. The website discovers it automatically: no homepage edits, manual list, build command, or extra publishing settings.

For example, add `posts/2026-10-17-a-note-on-databases.md`. It appears as **A note on databases**, dated 17 October 2026. Dates are optional; `My first post.txt` also works.

Markdown, text, and HTML can be read on the site. PDFs, images, audio, and video have previews where supported by the browser. Other formats, including Word documents, appear as downloadable posts. See `posts/README.md` for the full guide. `_example.md` is a template omitted from the public post list; replace its content and remove the leading underscore to publish it.

The actual GitHub Pages site automatically discovers files using GitHub's public directory API. The separate test deployment and local HTTP previews use `posts/_index.json`. An optional `python3 scripts/index-posts.py` refreshes that preview snapshot; this command is not needed when publishing posts to GitHub Pages. No GitHub token is needed or included.

## Replace the existing GitHub Pages site

Repository: https://github.com/kiansahafi/kiansahafi.github.io
Live URL: https://kiansahafi.github.io/

1. Extract `Kian_Sahafi_Website.zip` on your computer.
2. Open the repository on GitHub and select the `main` branch.
3. Choose **Add file → Upload files**.
4. Upload the **contents** of the extracted folder into the repository root. `index.html` must replace the existing root `index.html`; do not upload a containing folder or the ZIP itself. Keep the `assets/` folder and its contents together.
5. Commit the changes to **main**. If you create a pull request instead, merge it into main to publish.
6. Wait for the Pages deployment to finish, then open the live URL. If the browser still shows the old version, use a hard refresh.

No installation, build command, environment variables, backend, or API keys are needed.

The live site's HTML was checked on 17 October 2026 and exactly matched `main/index.html`. The latest public GitHub Pages deployment points to `main` at commit `a47195bc21e3efe314080e756e80cfb13596fc5f`. This update keeps the same root-file publishing layout.

If the repository's Pages configuration has been changed independently, the intended setting is **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**. With that setting, committing the files to main publishes them automatically. You do not need to add a GitHub Actions workflow.

GitHub documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Files in the upload bundle

- `index.html`, `style.css`, `script.js`, `theme.js`: the portfolio and shared appearance.
- `post.html`, `blog-core.js`, `blog.js`: the blog list and post reader.
- `posts/`: your posts, writing instructions, an unpublished Markdown template, and the preview snapshot.
- `assets/`: your portrait, favicon, and locally bundled Markdown/sanitizer libraries with their licenses.
- `scripts/index-posts.py`: optional snapshot generation for non-GitHub/local previews.
- `.nojekyll`: tells GitHub Pages to publish the static files directly.
- `README.md`: this guide.

Keep the existing **Deploy from a branch → main → /(root)** configuration. No custom Actions workflow or new settings are needed. On systems that hide dotfiles, enable hidden files when selecting uploads; the site also works with GitHub Pages' standard static-asset handling if the empty `.nojekyll` file is omitted.

## Make future changes

- Edit your text and links in `index.html`.
- Change colours, layout, or spacing in `style.css`.
- Replace `assets/kian-sahafi.jpg` to change the portrait, keeping the filename.
- `script.js` controls the copy-email button, section index, and decorative sketch/portrait movement. `theme.js` handles the shared theme.
- Add future posts to `posts/`; the blog list is automatic. Files in nested folders are supporting assets, not separate posts.

The portrait is the supplied original image. All images and scripts are local. Fonts use the visitor's system fonts. There are no analytics, trackers, third-party widgets, or remote font dependencies.

## Interactions and accessibility

- CV sections, dated entries, and project descriptions are always visible and work without JavaScript. A section index links directly to each heading.
- The portfolio, navigation, and email links work without JavaScript. The blog has a no-JavaScript link to the original files on GitHub.
- Black is the default theme, including when JavaScript or local storage is unavailable. A visitor can choose the light theme; that preference is saved only in their browser. Theme preferences from the earlier design are intentionally reset for this update.
- Pointer movement gently moves the portrait and decorative network. Touch devices show a static portrait; the sketch can also be rearranged with a button.
- Reduced-motion preferences disable animated movement.
- Copying email requires the browser's clipboard permission. If unavailable, the normal email link remains available and a text fallback is shown.
- Responsive layouts cover phones, tablets, and larger screens. Keyboard focus and a skip link are included.

## Verification

JavaScript syntax, section anchors, local asset paths, unique IDs, and image alternative text were checked. Seven automated blog tests cover automatic discovery, file formats, safe filenames, optional metadata, API fallback, preview snapshots, and Markdown rendering. The current environment does not expose the browser-control capability required for automated visual and browser interaction tests; use the deployed test site to review those details on your own devices.

The test deployment is separate from the original GitHub site. Creating it does not change your public GitHub website.
