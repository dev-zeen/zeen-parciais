import math, sys
ANG = 37          # inclinação das cápsulas da marca Zeen
W = 150           # espessura
SPACE = 62        # vão perpendicular entre cápsulas
LENGTHS = [290, 430, 580]
c, s = math.cos(math.radians(ANG)), math.sin(math.radians(ANG))
GAP = (W + SPACE) / c   # deslocamento horizontal para manter o vão perpendicular

def build():
    """Cápsulas (segmentos com raio W/2) e o ponto ao vivo, em coordenadas locais."""
    caps = []
    for i, L in enumerate(LENGTHS):
        seg = L - W
        bx, by = i * GAP, 0.0                      # extremidade de baixo (bases alinhadas)
        tx, ty = bx + seg * s, by - seg * c        # extremidade de cima
        caps.append(((bx, by), (tx, ty), L))
    (_, (tx, ty), _) = caps[-1]
    dot = (tx + 170, ty + 6, 54, 88)               # cx, cy, raio, raio do pulso
    return caps, dot

def bbox(caps, dot):
    xs, ys = [], []
    for (b, t, _) in caps:
        for (x, y) in (b, t):
            xs += [x - W/2, x + W/2]; ys += [y - W/2, y + W/2]
    cx, cy, r, R = dot
    xs += [cx - R, cx + R]; ys += [cy - R, cy + R]
    return min(xs), min(ys), max(xs), max(ys)

def mark(box, color='#F8F9FA', live='#1C1B22', ring=0.2):
    caps, dot = build()
    x0, y0, x1, y1 = bbox(caps, dot)
    scale = box / max(x1 - x0, y1 - y0)
    ox = 512 - (x0 + x1) / 2 * scale
    oy = 512 - (y0 + y1) / 2 * scale
    parts = []
    for (b, t, L) in caps:
        mx, my = (b[0] + t[0]) / 2, (b[1] + t[1]) / 2
        parts.append(f'<rect x="{mx - W/2:.1f}" y="{my - L/2:.1f}" width="{W}" height="{L}" rx="{W/2}" '
                     f'fill="{color}" transform="rotate({ANG} {mx:.1f} {my:.1f})"/>')
    cx, cy, r, R = dot
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R}" fill="{live}" opacity="{ring}"/>')
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{live}"/>')
    return f'<g transform="translate({ox:.1f} {oy:.1f}) scale({scale:.4f})">' + ''.join(parts) + '</g>'

BG = ('<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
      '<stop offset="0" stop-color="#FFA02A"/><stop offset="1" stop-color="#FF7A00"/></linearGradient></defs>'
      '<rect width="1024" height="1024" fill="url(#bg)"/>')

def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{body}</svg>\n'

out = sys.argv[1]
# iOS / Play Store: fundo cheio, símbolo ocupando ~60% (a máscara arredonda os cantos)
open(f'{out}/icon.svg', 'w').write(svg(BG + mark(690)))
# Android adaptativo: só o símbolo, dentro da zona segura (círculo central de 66% = 676px)
open(f'{out}/adaptive.svg', 'w').write(svg(mark(540)))
# Monocromático (ícones temáticos, Android 13+)
open(f'{out}/mono.svg', 'w').write(svg(mark(540, color='#000000', live='#000000', ring=0.35)))
