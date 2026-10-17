# Add a blog post

Add a file directly to this folder and commit it to the `main` branch of your GitHub repository. It will be discovered by the website automatically. You do not need to edit the homepage, maintain a list, run a build, or add a workflow.

For example:

`posts/2026-10-17-my-first-post.md`

The filename becomes the title in the blog list. An optional `YYYY-MM-DD-` prefix supplies the date and sorts dated posts newest first. You can also use a name such as `My thoughts on databases.txt`.

## Formats

| File | What readers see |
| --- | --- |
| `.md`, `.markdown` | Formatted Markdown article, including headings, links, lists, tables, and code blocks |
| `.txt`, `.text` | Text article with line breaks preserved |
| `.html`, `.htm` | HTML article in an embedded, script-free frame |
| `.pdf` | PDF viewer, with the original file available to open or download |
| `.jpg`, `.png`, `.webp`, `.gif`, `.avif`, `.svg` | Image post |
| `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac` | Audio player when the browser supports the format |
| `.mp4`, `.webm`, `.mov` | Video player when the browser supports the format |
| `.json`, `.csv`, `.yaml`, `.tex`, and common code files | Readable text/code |
| Everything else, including `.docx`, `.odt`, or `.ipynb` | A post with a link to open or download the original file |

Any file type can appear in the list. Not every format can be converted into an inline article; formats without a preview remain downloadable. Markdown is recommended for normal blog writing.

## Markdown example

```markdown
# A title for the article

Write your introduction here.

## A section

- One idea
- Another idea

You can add **bold**, *italics*, and [links](https://example.com).
```

Optional metadata at the start of a Markdown or text file controls the title and date in the reader:

```yaml
---
title: "My first post"
date: "2026-10-17"
---
```

No metadata is required. The blog list always gets its title and date from the filename; the reader can use the metadata or a Markdown heading.

## Images and supporting files

Put images and other supporting files in a subfolder such as `posts/assets/`. They will not appear as separate posts. In Markdown, use a relative link such as `![A description](assets/my-picture.jpg)`.

Only files directly inside `posts/` become posts; nested folders are for supporting assets. `README.md` and filenames beginning with `.` or `_` are omitted from the list. `_example.md` is an unpublished template: copy or rename it without the underscore and replace the text to publish your own writing. Files in a public repository are still public even when omitted from the blog list.

## Preview hosting

The GitHub Pages website automatically reads this folder from the public GitHub repository. The separate test deployment and a local HTTP preview use `_index.json`, a generated snapshot. To refresh that snapshot after adding local files, run `python3 scripts/index-posts.py` from the website folder. You never need this command when adding posts to the actual GitHub Pages site.

GitHub may briefly cache directory responses. Once a post commit has deployed, refresh the blog to see it. GitHub's unauthenticated API allows 60 requests per hour per visitor IP; only one directory request is made when the blog section is reached. A saved list or the packaged snapshot is used if the API is temporarily unavailable. No token is needed or included.

GitHub content API documentation: https://docs.github.com/en/rest/repos/contents
