"""Gera os PNGs finais a partir dos SVGs (render pelo qlmanage do macOS)."""
import os, re, struct, subprocess, sys, zlib
sys.path.insert(0, os.path.dirname(__file__))
from pngpix import read

S = os.path.dirname(os.path.abspath(__file__))

def render(svg_text, size, name):
    path = os.path.join(S, name + '.svg')
    open(path, 'w').write(svg_text)
    subprocess.run(['qlmanage', '-t', '-s', str(size), '-o', S, path], capture_output=True)
    return read(path + '.png')

def write_png(path, w, h, rows, channels):
    ct = 6 if channels == 4 else 2
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    def chunk(t, c): return struct.pack('>I', len(c)) + t + c + struct.pack('>I', zlib.crc32(t + c) & 0xffffffff)
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0)) \
        + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    open(path, 'wb').write(data)

def opaque(svg_path, size, out):
    w, h, bpp, rows = render(open(svg_path).read(), size, f'_op{size}')
    write_png(out, w, h, [bytes(r[i] for x in range(w) for i in range(x*bpp, x*bpp+3)) for r in rows], 3)

def transparent(svg_path, size, out):
    """Matte por diferença: alpha = 1 - (branco - preto); cor = preto / alpha."""
    src = open(svg_path).read()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', src, re.S).group(1)
    head = re.search(r'<svg[^>]*>', src).group(0)
    w, h, bpp, black = render(f'{head}<rect width="1024" height="1024" fill="#000"/>{inner}</svg>', size, '_k')
    _, _, _, white = render(f'{head}<rect width="1024" height="1024" fill="#fff"/>{inner}</svg>', size, '_w')
    rows = []
    for rb, rw in zip(black, white):
        line = bytearray()
        for x in range(w):
            kb = rb[x*bpp:x*bpp+3]; kw = rw[x*bpp:x*bpp+3]
            a = 255 - max(0, min(255, round(sum(kw[i] - kb[i] for i in range(3)) / 3)))
            if a == 0: line += b'\x00\x00\x00\x00'; continue
            line += bytes(min(255, round(kb[i] * 255 / a)) for i in range(3)) + bytes([a])
        rows.append(line)
    write_png(out, w, h, rows, 4)

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
opaque(f'{S}/icon.svg', 1024, f'{out}/icon.png')                 # iOS + Expo (sem alfa)
opaque(f'{S}/icon.svg', 512, f'{out}/play-store-icon-512.png')    # Play Console
opaque(f'{S}/icon.svg', 48, f'{out}/favicon.png')                 # web
transparent(f'{S}/adaptive.svg', 1024, f'{out}/adaptive-icon.png')
transparent(f'{S}/mono.svg', 1024, f'{out}/adaptive-icon-monochrome.png')
print('ok')
