"""Check Vietnamese glyph coverage in bundled fonts (requires fonttools)."""

from pathlib import Path
import re
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
VIETNAMESE = set(range(0x1EA0, 0x1EFA)) | {
    ord(char) for char in "ĂăÂâĐđÊêÔôƠơƯưÀÁÃÈÉÌÍÒÓÕÙÚÝàáãèéìíòóõùúý"
}
text = "".join(
    (ROOT / path).read_text(encoding="utf-8")
    for path in ("index.html", "js/config.js", "script/index.js")
)
required = VIETNAMESE | {
    ord(char) for char in text
    if char.isalpha() and (ord(char) < 0x250 or 0x1E00 <= ord(char) <= 0x1EFF)
}
fonts = sorted((ROOT / "fonts").glob("*.woff"))
assert len(fonts) == 7, "Expected the seven bundled Vietnamese font files"
fonts.append(ROOT / "fonts/MomoSignature-Regular.ttf")
for path in fonts:
    with TTFont(path) as font:
        missing = required - set(font.getBestCmap())
        assert not missing, f"{path.name} missing {sorted(missing)}"
        # Roboto Mono's upstream font uses precomposed glyphs without a GPOS table.
        if path.name != "RobotoMono-Variable.woff":
            assert "GPOS" in font, f"{path.name} missing mark positioning tables"
        if path.name == "RobotoMono-Variable.woff":
            axis = next(axis for axis in font["fvar"].axes if axis.axisTag == "wght")
            assert axis.minValue == 100 and axis.maxValue == 700

css = (ROOT / "style/style.css").read_text(encoding="utf-8")
for source in re.findall(r'url\("(\.\./fonts/[^"?]+)"\)', css):
    assert (ROOT / "style" / source).is_file(), f"Missing font URL: {source}"
assert '"Courier New"' not in css, "Receipt must use the bundled Vietnamese font"
assert '"Cafe24Dongdong"' not in css, "Display font must cover Vietnamese"
assert '"Nighthawk"' not in css, "Heading font must cover Vietnamese"
print(f"PASS: {len(fonts)} font faces cover Vietnamese and all current Latin text; font URLs exist")
