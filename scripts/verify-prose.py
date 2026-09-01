import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/lib"))
from format_prose import format_prose

wifi = "「何度やっても接続できない」「設定が難しい」といった声が少数見られます。"
out_wifi = format_prose(wifi)
assert out_wifi.count("demerit") == 2
assert "connect" not in out_wifi  # sanity
assert out_wifi.index("demerit") < out_wifi.rindex("demerit")

carpet = "リビングのラグなどに絡まった髪の毛やホコリをしっかり吸引します。モップが自動でリフトアップするため、カーペットを濡らす心配もなく安心です。"
out_carpet = format_prose(carpet)
assert out_carpet.count("benefit") <= 2

print("ok")
