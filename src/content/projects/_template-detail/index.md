---
# ŞABLON — detail modu (oyunlar, tool'lar). draft: true olduğu için sitede görünmez.
# Kullanım: klasörü kopyala, adını proje slug'ı yap (küçük harf, tire: my-game), draft'ı false yap.
# Zorunlu: title, summary, category, status, date, cover (alt metniyle). Gerisi opsiyonel.
title: { en: Project title, tr: Proje adı }
summary: { en: One sentence pitch., tr: Tek cümlelik tanıtım. }
category: games              # src/data/categories.yaml'daki id
status: in-progress          # released | completed | in-progress | prototype | jam
date: 2026-01-01             # yayın / bitiş tarihi
order: 99                    # opsiyonel: küçük sayı önce gelir
featured: false              # true → sekmelerin üstündeki büyük kart (tek proje önerilir)
draft: true
cover:
  src: ./cover.jpg           # 16:9 önerilir, uzun kenar en fazla 2560 px
  alt: { en: Describe the image, tr: Görseli anlat }
gallery: []                  # kart lightbox'ı ve paylaşım için ek görseller
tags: []                     # serbest: [FPS, Low-poly]
tools: []                    # src/data/tools.yaml id'leri: [unity, csharp]
links:
  steam: ''
  itch: ''
  github: ''
  trailer: ''                # YouTube linki veya video id'si
  website: ''
spec:
  genre: { en: '', tr: '' }
  engine: ''
  platforms: []              # [Windows, WebGL, Android]
  team: 1                    # 1 = solo
  duration: { en: '', tr: '' }
  publisher: ''
blocks:                      # detay sayfasında, metnin altında bu sırayla gösterilir
  - type: youtube
    id: VIDEO_ID
  - type: itch
    url: https://itch.io/embed-upload/0000000
    width: 960
    height: 600
  # - type: gallery
  #   images:
  #     - { src: ./01.jpg, alt: { en: '', tr: '' } }
  # - type: model
  #   src: ./model.glb
  # - type: code
  #   file: ./snippets/Example.cs
  #   lang: csharp
  # - type: download
  #   file: ./document.pdf
---
