/**
 * Confere o contraste WCAG dos pares definidos em styles/tokens.ts.
 * Uso: node scripts/check-contrast.mjs
 */
import { contrastPairs, palette } from '../styles/tokens.ts';

function luminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

let failures = 0;

for (const theme of ['light', 'dark']) {
  for (const [foreground, background, minimum] of contrastPairs) {
    const ratio = contrast(palette[theme][foreground], palette[theme][background]);
    const ok = ratio >= minimum;
    if (!ok) failures += 1;
    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${theme.padEnd(5)} ${foreground} / ${background}: ${ratio.toFixed(2)} (mín. ${minimum})`
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} par(es) abaixo do mínimo.`);
  process.exit(1);
}

console.log('\nTodos os pares passam.');
