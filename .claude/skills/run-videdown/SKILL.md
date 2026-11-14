---
name: run-videdown
description: Launch the videdown Electron app (yt-dlp video downloader) in dev mode on Windows. Use when asked to run, start, or launch videdown.
---

# Run videdown

videdown is an Electron 30 + Vue 3 + Vite 5 app. `pnpm dev` builds the main/preload
via vite-plugin-electron and auto-opens the Electron window. Verified working 2026-11-14.

## One-time prerequisites

1. **Node 18+** (Vite 5 requirement). The default PATH node on this machine is v16 —
   use the v22 install: `export PATH="/d/sort/itsort/nodejs/node-v22:$PATH"`
2. **Dependencies**: `pnpm install` (pnpm 11). `pnpm-workspace.yaml` must allow build
   scripts (`allowBuilds: {electron: true, esbuild: true}`) or the Electron binary
   is never downloaded.
3. **Tools in project root** (main.ts resolves them from `APP_ROOT` first):
   - `yt-dlp.exe` — https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
   - `ffmpeg.exe` — copy from system (`D:\sort\itsort\nodejs\node-v22\ffmpeg.exe`) or gyan.dev builds

## Launch

```bash
export PATH="/d/sort/itsort/nodejs/node-v22:$PATH"
unset ELECTRON_RUN_AS_NODE   # critical — see troubleshooting
pnpm dev
```

Or double-click `start-dev.bat` in the project root (sets Node 22 PATH, clears
ELECTRON_RUN_AS_NODE, runs pnpm dev).

## Verify it's running

- Electron window titled "Videdown - 全平台视频下载" appears
- `tasklist | grep -i electron` shows ~4 electron.exe processes (main/GPU/renderer/utility)
- Vite serves at http://localhost:5173, no errors in dev output
- Paste a video link (抖音/B站/YouTube) into the window to test parse + download

## Troubleshooting

- **Main process crashes with `SyntaxError: The requested module 'electron' does not provide an export named 'BrowserWindow'`**
  and the error banner says `Node.js v20.11.1` (instead of Electron): the environment variable
  `ELECTRON_RUN_AS_NODE=1` is set (origin unknown — not in registry or shell profiles, appears
  in the ambient environment). electron.exe then runs as plain Node. `unset ELECTRON_RUN_AS_NODE`
  before `pnpm dev`.
- **`electron.exe --version` prints v20.11.1**: same cause (Node mode; 20.11.1 is Electron 30's
  bundled Node). With the var unset it prints v30.0.1.
- **`ERR_PNPM_IGNORED_BUILDS` / electron binary missing**: set `allowBuilds` in
  pnpm-workspace.yaml and re-run `pnpm install`.
- **GitHub downloads time out** (China network): retry, or use a mirror for yt-dlp/ffmpeg;
  ffmpeg is already available on this machine at `D:\sort\itsort\nodejs\node-v22\ffmpeg.exe`.
