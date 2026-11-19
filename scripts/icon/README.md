# Ícone do app

Fonte do ícone em SVG, gerada por `gen.py`. Os PNGs são renderizados pelo `qlmanage` (macOS), sem dependências.

```bash
python3 scripts/icon/gen.py scripts/icon     # regenera os SVGs (ajuste formas/cores aqui)
python3 scripts/icon/build.py /tmp/icon-out  # gera os PNGs
```

| Arquivo gerado | Destino |
| --- | --- |
| `icon.png` (1024, sem alfa) | `assets/images/icon.png`: iOS e App Store |
| `adaptive-icon.png` (1024, transparente, zona segura de 66%) | `assets/images/`: Android |
| `adaptive-icon-monochrome.png` | `assets/images/`: ícones temáticos do Android 13+ |
| `favicon.png` (48) | `assets/images/`: web |
| `play-store-icon-512.png` (512, sem alfa) | `assets/store/`: enviar manualmente na Play Console |

O fundo do Android adaptativo é a cor `backgroundColor` do `app.json` (`#FF8A00`).
