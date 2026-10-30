---
# ŞABLON — lightbox modu (modeller, tasarımlar). draft: true olduğu için sitede görünmez.
# Kullanım: klasörü kopyala, adını proje slug'ı yap, draft'ı false yap. en.md / tr.md gerekmez.
title: { en: Model title, tr: Model adı }
summary: { en: One sentence., tr: Tek cümle. }
category: models
status: released             # released | completed | in-progress | prototype | jam
date: 2026-01-01
draft: true
cover:
  src: ./cover.jpg           # lightbox'ta ilk görsel; uzun kenar en fazla 2560 px
  alt: { en: Describe the image, tr: Görseli anlat }
gallery: []                  # lightbox'ta kapaktan sonra gelen görseller
  # - { src: ./01.jpg, alt: { en: '', tr: '' } }
tags: []
tools: []
links:
  sketchfab: ''
  artstation: ''
  behance: ''
# model:                     # varsa lightbox'ta "3D Görüntüle" butonu çıkar (.glb önerilir, 20 MB altı)
#   src: ./model.glb
#   tris: 0
#   texture: 2048 px
#   renderer: Blender Cycles
---
