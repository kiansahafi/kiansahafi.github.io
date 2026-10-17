"""Create a local/Sites preview snapshot. GitHub Pages discovers files itself."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
posts = (root / "dist" / "posts") if (root / "dist" / "posts").is_dir() else root / "posts"
files = sorted(
    item.name for item in posts.iterdir()
    if item.is_file() and not item.name.startswith((".", "_"))
    and item.stem.lower() != "readme"
)
(posts / "_index.json").write_text(json.dumps(files, ensure_ascii=False, indent=2) + "\n")
print(f"Indexed {len(files)} published posts for the preview.")
