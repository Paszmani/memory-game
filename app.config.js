/**
 * Config dinâmica: mantém TUDO do app.json e injeta `experiments.baseUrl`
 * SOMENTE no build web (o launcher scripts/export-web.js define EXPO_WEB=1).
 *
 * Motivo: o baseUrl "/memory-game" só serve para hospedar o web sob esse
 * caminho (GitHub Pages), mas o Expo o embute no bundle de TODAS as
 * plataformas via EXPO_BASE_URL. No APK standalone o expo-router passava a
 * resolver a rota inicial sob "/memory-game" (inexistente no nativo) → tela
 * branca. Mantendo-o fora do app.json, o nativo/EAS nunca o recebe; só o
 * export web o injeta aqui.
 */

const WEB_BASE_URL = '/memory-game';

module.exports = ({ config }) => {
  if (process.env.EXPO_WEB === '1') {
    config.experiments = {
      ...config.experiments,
      baseUrl: WEB_BASE_URL,
    };
  }

  return config;
};
