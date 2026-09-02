import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/lib"))
from format_prose import format_prose, MAX_MARKER_CHARS, MAX_MARKERS_PER_PARAGRAPH

HIGHLIGHT_RE = re.compile(r'<strong class="em-key[^"]*">([^<]*)</strong>')


def highlights(html: str) -> list[str]:
    return [m.replace("\u2060", "") for m in HIGHLIGHT_RE.findall(html)]


wifi = "「何度やっても接続できない」「設定が難しい」といった声が少数見られます。"
out_wifi = format_prose(wifi)
h_wifi = highlights(out_wifi)
assert len(h_wifi) == 2, h_wifi
assert all(len(h) <= MAX_MARKER_CHARS for h in h_wifi)
assert out_wifi.count("demerit") == 2

quiet = "「離れた部屋では止まっているかと思うほど静か」との声多数。"
out_quiet = format_prose(quiet)
h_quiet = highlights(out_quiet)
assert out_quiet.count("benefit") >= 1, out_quiet
assert out_quiet.count("demerit") == 0, out_quiet
assert all(len(h) <= MAX_MARKER_CHARS for h in h_quiet)

carpet = "リビングのラグなどに絡まった髪の毛やホコリをしっかり吸引します。モップが自動でリフトアップするため、カーペットを濡らす心配もなく安心です。"
out_carpet = format_prose(carpet)
h_carpet = highlights(out_carpet)
assert len(h_carpet) <= MAX_MARKERS_PER_PARAGRAPH, h_carpet
assert all(len(h) <= MAX_MARKER_CHARS for h in h_carpet)

long_quote = "「とにかく毎日の床掃除が楽になって買って良かったです」という声があります。"
out_long = format_prose(long_quote)
h_long = highlights(out_long)
assert len(h_long) <= MAX_MARKERS_PER_PARAGRAPH
assert all(len(h) <= MAX_MARKER_CHARS for h in h_long)

print("ok")
