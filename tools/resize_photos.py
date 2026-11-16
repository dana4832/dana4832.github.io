"""사진 원본을 웹용 크기로 줄입니다. (Pillow 필요: pip install pillow)

    python tools/resize_photos.py talks

assets/talks/<폴더>/<사진>  →  assets/talks-web/<폴더>-<번호>.jpg      (긴 변 1600px)
                              assets/talks-web/t/<폴더>-<번호>.jpg    (목록용 720px)

원본 폴더(assets/talks)는 .gitignore 에 있어 GitHub에 올라가지 않습니다.
촬영 위치 등 사진 속 EXIF 정보는 저장하지 않습니다.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent / "assets"
name = sys.argv[1] if len(sys.argv) > 1 else "talks"
src, dst = root / name, root / f"{name}-web"
(dst / "t").mkdir(parents=True, exist_ok=True)

for folder in sorted(p for p in src.iterdir() if p.is_dir()):
    key = folder.name.replace(" ", "-")
    photos = sorted(f for f in folder.iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".png"})
    for i, photo in enumerate(photos, 1):
        im = ImageOps.exif_transpose(Image.open(photo)).convert("RGB")
        out = f"{key}-{i}.jpg"
        large = im.copy()
        large.thumbnail((1600, 1600), Image.LANCZOS)
        large.save(dst / out, "JPEG", quality=82, optimize=True, progressive=True)
        small = im.copy()
        small.thumbnail((720, 720), Image.LANCZOS)
        small.save(dst / "t" / out, "JPEG", quality=78, optimize=True, progressive=True)
        print(f"{out}  <-  {folder.name}/{photo.name}  {large.width}x{large.height}")
