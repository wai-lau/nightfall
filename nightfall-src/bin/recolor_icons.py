import colorsys
from collections import Counter
from PIL import Image

# Recolor program icons so the body matches the new sector color. Detect the
# icon's dominant (line) color, then remap every pixel sharing that hue to the
# target — scaled by brightness so the body becomes EXACTLY the target and its
# shades become proportionally darker. Grays, black, white and the slate bezel
# (different hue) are left untouched.

JOBS = [
    ("img/programs/Turbo.png", (140, 120, 230)),
    ("img/programs/TurboDX.png", (140, 120, 230)),
    ("img/programs/Fiddle.png", (140, 120, 230)),
]

HUE_TOL = 30.0 / 360.0  # within 30 degrees of the line hue
SAT_MIN = 0.12


def hue_dist(a, b):
    d = abs(a - b)
    return min(d, 1.0 - d)


def recolor(path, target):
    im = Image.open(path).convert("RGBA")
    px = list(im.getdata())
    opaque = Counter((r, g, b) for (r, g, b, a) in px if a > 0)
    primary = opaque.most_common(1)[0][0]
    ph, ps, pv = colorsys.rgb_to_hsv(*[c / 255 for c in primary])
    tr, tg, tb = target
    out = []
    changed = 0
    for (r, g, b, a) in px:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if a > 0 and s > SAT_MIN and hue_dist(h, ph) < HUE_TOL:
            ratio = v / pv if pv else 1.0
            nr = min(255, round(tr * ratio))
            ng = min(255, round(tg * ratio))
            nb = min(255, round(tb * ratio))
            out.append((nr, ng, nb, a))
            changed += 1
        else:
            out.append((r, g, b, a))
    im.putdata(out)
    im.save(path)
    print(f"{path}: primary {primary} -> {target}, {changed}/{len(px)} px remapped")


for path, target in JOBS:
    recolor(path, target)
