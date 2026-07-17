# Jogo da Memória (GSB)

Jogo da memória personalizável para totem e web — Expo SDK 54 + expo-router.
Temas de cartas próprios (imagens/emoji), captura de leads opcional e
exportação/importação do tema como arquivo. Publicado no GitHub Pages
(`/memory-game`) via push na `main`.

| Plataforma | Saída | Comando |
|---|---|---|
| Web (dev) | Expo em `localhost:8081` | `npm run web` |
| **Windows** | `.exe` (Electron) | `npm run electron:dist` |
| **Android** | APK nativo | `npm run android:apk` |

## Comandos

```bash
npm install                # uma vez
npm run web                # dev server web
npx tsc --noEmit           # checagem de tipos (0 erros)
npm run predeploy          # export web (dist/)
```

Requisitos: Node 20+. Para Android: Android Studio (traz JDK e SDK).
Para o .exe: `npm --prefix electron install` (uma vez).

## Build Android (APK)

```bash
npm run android:apk        # APK direto por linha de comando
# ou, pelo Android Studio:
npm run android:sync       # expo prebuild (gera/atualiza android/)
npm run android:open       # abre android/ no Android Studio -> Run / Build APK(s)
```

O `android:sync`/`android:apk` fazem `expo prebuild` **sem `--clean`**: a pasta
`android/` (descartável, no .gitignore) é reaproveitada entre builds — os
caches do Gradle sobrevivem e o Android Studio não volta a baixar as
dependências a cada sync. O primeiro build ainda baixa tudo (normal); dos
seguintes em diante é incremental (`org.gradle.caching` ligado). Projeto
nativo corrompido ou upgrade do Expo? `npm run android:sync:clean` regenera
do zero.

O build usa um JDK 17–21 — o script acha o JBR do Android Studio sozinho
(override: `JAVA_HOME_ANDROID`). APK em
`android/app/build/outputs/apk/release/app-release.apk` (assinado com a
keystore de debug do Expo — suficiente para distribuição direta).

## Build Windows (Electron)

```bash
npm --prefix electron install   # uma vez
npm run electron:dist           # exporta a web p/ electron/web + empacota
```

Sai em `electron/release/win-unpacked/` (pasta com o exe) + `.zip`. Porta fixa
39218 (origin estável → as personalizações persistem entre aberturas). Leads
em `data/leads/` ao lado do exe. Smoke test: `KIOSK_SMOKE=1`.

## Personalização

Menu ⚙ no app: cores (picker com paleta em grupos + hex opcional), textos,
estilo das cartas, dificuldade, temas de cartas com imagens, campos do
formulário de lead. **Exportar/importar tema** (`memoria-tema.json`) funciona
em todas as plataformas — download na web/desktop, folha de compartilhamento
e seletor de documentos no Android. Leads: exportação CSV pt-BR padronizada
dos três jogos (`;`, BOM, data/hora locais).
