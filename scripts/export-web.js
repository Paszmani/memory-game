/**
 * Exporta o build web estático com EXPO_WEB=1 — o sinal que o app.config.js usa
 * para injetar `experiments.baseUrl` (GitHub Pages sob /memory-game). O
 * nativo/EAS NUNCA recebe esse env, então o APK standalone não abre em branco.
 *
 * Launcher em Node (em vez de `set VAR=...`/cross-env) para funcionar igual no
 * Windows e em POSIX. Argumentos extras são repassados ao expo export
 * (ex.: --output-dir electron/web).
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const extra = process.argv.slice(2);
// No Windows o executável é npx.cmd; execução via shell resolve o .cmd/.ps1.
const result = spawnSync('npx', ['expo', 'export', '-p', 'web', ...extra], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EXPO_WEB: '1' },
});

if (result.error) {
  console.error('\nExport web falhou:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
