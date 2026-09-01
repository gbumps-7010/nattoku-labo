from pathlib import Path
import re
import sys

sys.path.insert(0, "scripts/lib")
from format_prose import format_prose

text = "リビングのラグなどに絡まった髪の毛やホコリをしっかり吸引します。モップが自動でリフトアップするため、カーペットを濡らす心配もなく安心です。"
out = format_prose(text)
assert "心配" in out and "benefit" in out

rel = format_prose("Amazonと楽天の評価に大きな乖離はなく、大部分のユーザーが掃除性能と自動メンテナンス機能に満足しており、意見の一貫性は高いです。")
assert "満足しており" in rel

neg = format_prose("特に階段のある家では注意が必要です。")
assert "demerit" in neg

print("ok")
