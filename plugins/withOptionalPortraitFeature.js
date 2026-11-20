const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

/**
 * `orientation: "portrait"` gera `android:screenOrientation="portrait"`, e o Android passa a
 * exigir implicitamente o recurso de tela em retrato. A Play Store então esconde o app de
 * tablets, desktops e Android XR. Declarar o recurso como opcional mantém o app em retrato
 * onde houver suporte, sem restringir quem pode instalar.
 */
module.exports = function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const features = (manifest['uses-feature'] ??= []);
    const existing = features.find((item) => item.$?.['android:name'] === FEATURE);

    if (existing) existing.$['android:required'] = 'false';
    else features.push({ $: { 'android:name': FEATURE, 'android:required': 'false' } });

    return cfg;
  });
};
