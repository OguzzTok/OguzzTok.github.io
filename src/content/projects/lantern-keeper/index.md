---
# ÖRNEK PROJE (detail modu) — kendi projenle değiştir veya sil.
title: { en: Lantern Keeper (sample), tr: Fener Bekçisi (örnek) }
summary:
  en: A short puzzle-adventure about keeping a lighthouse alive through one long night.
  tr: Uzun bir gece boyunca bir deniz fenerini ayakta tutmaya çalıştığın kısa bir bulmaca-macera oyunu.
category: games
status: released
date: 2025-06-14
order: 1
featured: true
draft: false
cover:
  src: ./cover.jpg
  alt: { en: The lighthouse at dusk, tr: Alacakaranlıkta deniz feneri }
gallery:
  - src: ./01.jpg
    alt: { en: Lighthouse interior puzzle, tr: Fenerin içindeki bulmaca }
  - src: ./02.jpg
    alt: { en: Storm level, tr: Fırtına bölümü }
tags: [Puzzle, Adventure, Low-poly]
tools: [unity, csharp, blender]
links:
  itch: https://itch.io
  github: https://github.com/OguzzTok
  steam: ''
  trailer: ''
spec:
  genre: { en: Puzzle adventure, tr: Bulmaca-macera }
  engine: Unity 6
  platforms: [Windows, WebGL]
  team: 3
  duration: { en: 8 weeks, tr: 8 hafta }
  publisher: ''
blocks:
  - type: gallery
    images:
      - src: ./03.jpg
        alt: { en: Final scene, tr: Final sahnesi }
  - type: code
    file: ./snippets/LanternController.cs
    lang: csharp
    caption: { en: Lantern fuel system, tr: Fener yakıt sistemi }
  - type: download
    file: ./gdd-sample.pdf
    label: { en: Game design document, tr: Oyun tasarım belgesi }
---
