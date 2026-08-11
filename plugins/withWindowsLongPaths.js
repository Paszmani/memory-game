// Config plugin: contorna o limite de 260 caracteres (MAX_PATH) do Windows ao
// compilar o codegen C++ da Nova Arquitetura (Fabric) no Android.
//
// Mantem o CMake que o React Native espera, mas forca o build a usar o ninja
// 1.12+ (que suporta caminhos longos via \\?\) e eleva o CMAKE_OBJECT_PATH_MAX.
// Como injeta no app/build.gradle via mod do Expo, sobrevive a `expo prebuild`,
// inclusive com --clean. No-op fora do Windows (o `if (ninja121.exists())`).
const { withAppBuildGradle } = require('expo/config-plugins');

const SENTINEL = 'CMAKE_OBJECT_PATH_MAX';

const CMAKE_BLOCK = `
        // Windows MAX_PATH (260) workaround — Nova Arquitetura / codegen C++ do Fabric.
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=1024"
                def ninja121 = new File(android.sdkDirectory, "cmake/4.1.2/bin/ninja.exe")
                if (ninja121.exists()) {
                    arguments "-DCMAKE_MAKE_PROGRAM=\${ninja121.absolutePath.replace('\\\\', '/')}"
                }
            }
        }`;

module.exports = function withWindowsLongPaths(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      return cfg;
    }
    let contents = cfg.modResults.contents;
    if (contents.includes(SENTINEL)) {
      return cfg; // ja aplicado — idempotente, evita duplicar o bloco
    }
    // Insere logo apos a abertura do bloco defaultConfig { ... }
    contents = contents.replace(
      /defaultConfig\s*\{/,
      (match) => `${match}\n${CMAKE_BLOCK}`
    );
    cfg.modResults.contents = contents;
    return cfg;
  });
};
