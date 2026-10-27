/**
 * İçerik şemaları. Bir alan eksik veya hatalıysa build durur.
 * Alanların açıklaması ve örnekleri için CLAUDE.md'deki "İçerik ekleme tarifleri"ne bak.
 */
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

// ---------- Ortak parçalar ----------

const text = z.string().trim().optional();

/** İki dilli metin: en az bir dil dolu olmalı. Boş dil build'de diğerine düşer. */
const localized = z
  .object({ en: text, tr: text })
  .refine((v) => Boolean(v.en || v.tr), 'En az bir dil (en veya tr) dolu olmalı');

/** İki dilli ama tamamen boş bırakılabilen metin. */
const localizedOptional = z.object({ en: text, tr: text }).optional();

/** Boş bırakılabilen URL (şablonlarda "" yazılabilsin diye). */
const optionalUrl = z.union([z.url(), z.literal('')]).optional();

/** Tek nesneli YAML dosyaları (site.yaml gibi) için: alanlar dosyanın en üst seviyesinde durur. */
const singleton = (path: string) =>
  file(path, { parser: (contents) => ({ main: parseYaml(contents) }) });

/** Proje klasörüne göre göreli dosya yolu: ./model.glb, ./snippets/Player.cs */
const relativeFile = (ext: RegExp, hint: string) =>
  z.string().regex(/^\.\//, 'Yol ./ ile başlamalı').regex(ext, hint);

export const PROJECT_STATUSES = ['released', 'in-progress', 'prototype', 'jam'] as const;

// ---------- Kategoriler (sekmeler) ----------

const categories = defineCollection({
  loader: file('src/data/categories.yaml'),
  schema: z.object({
    name: localized,
    order: z.number().int(),
    visible: z.boolean().default(true),
    /** detail: ayrı detay sayfası · lightbox: sayfada lightbox açılır */
    mode: z.enum(['detail', 'lightbox']),
  }),
});

// ---------- Araçlar (tek liste; projeler ve Hakkımda buradaki id'leri kullanır) ----------

const tools = defineCollection({
  loader: file('src/data/tools.yaml'),
  schema: z.object({
    label: z.string(),
  }),
});

// ---------- Projeler ----------

const projects = defineCollection({
  // Her proje kendi klasöründe: src/content/projects/<slug>/index.md
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0]!,
  }),
  schema: ({ image }) => {
    const picture = z.object({ src: image(), alt: localized });

    const block = z.discriminatedUnion('type', [
      z.object({ type: z.literal('gallery'), images: z.array(picture).min(1), caption: localizedOptional }),
      z.object({ type: z.literal('youtube'), id: z.string().min(5), title: localizedOptional }),
      z.object({
        type: z.literal('model'),
        src: relativeFile(/\.(glb|gltf)$/, '.glb veya .gltf olmalı'),
        caption: localizedOptional,
      }),
      z.object({
        type: z.literal('code'),
        file: relativeFile(/\.[a-z0-9]+$/i, 'Uzantılı bir dosya olmalı'),
        lang: z.string(),
        caption: localizedOptional,
      }),
      z.object({
        type: z.literal('itch'),
        url: z.url().refine((u) => /(^https:\/\/itch\.io\/embed|itch\.zone)/.test(u), 'itch.io embed adresi olmalı'),
        width: z.number().int().default(960),
        height: z.number().int().default(600),
        title: localizedOptional,
      }),
      z.object({
        type: z.literal('download'),
        file: relativeFile(/\.[a-z0-9]+$/i, 'Uzantılı bir dosya olmalı'),
        label: localizedOptional,
      }),
    ]);

    return z.object({
      title: localized,
      summary: localized,
      category: reference('categories'),
      status: z.enum(PROJECT_STATUSES),
      date: z.coerce.date(),
      order: z.number().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      cover: picture,
      gallery: z.array(picture).default([]),
      tags: z.array(z.string()).default([]),
      tools: z.array(reference('tools')).default([]),
      links: z
        .object({
          steam: optionalUrl,
          itch: optionalUrl,
          github: optionalUrl,
          trailer: text, // YouTube linki veya video id'si
          sketchfab: optionalUrl,
          artstation: optionalUrl,
          website: optionalUrl,
        })
        .default({}),
      /** Lightbox modunda "3D Görüntüle" butonu ve teknik bilgi */
      model: z
        .object({
          src: relativeFile(/\.(glb|gltf)$/, '.glb veya .gltf olmalı'),
          tris: z.number().int().positive().optional(),
          texture: text,
          renderer: text,
        })
        .optional(),
      /** Detay sayfasındaki Spec Sheet; boş alanlar gizlenir */
      spec: z
        .object({
          genre: localizedOptional,
          engine: text,
          platforms: z.array(z.string()).default([]),
          team: z.number().int().positive().optional(), // 1 = solo
          duration: localizedOptional,
          publisher: text,
        })
        .default({ platforms: [] }),
      /** Detay sayfasında 3 bölümün altında, yazıldığı sırayla gösterilen medya blokları */
      blocks: z.array(block).default([]),
    });
  },
});

/** Detay modundaki uzun metinler: <slug>/en.md ve <slug>/tr.md */
const projectTexts = defineCollection({
  loader: glob({
    pattern: '*/{en,tr}.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({}),
});

// ---------- Sertifikalar ----------

const certificates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/certificates' }),
  schema: ({ image }) =>
    z.object({
      title: localized,
      issuer: z.string(),
      instructor: text,
      date: z.coerce.date(),
      hours: z.number().positive().optional(),
      credentialId: text,
      verifyUrl: optionalUrl,
      logo: image().optional(), // yoksa kurumun baş harfleri gösterilir
      order: z.number().optional(),
    }),
});

// ---------- Tekil veri dosyaları (src/data) ----------

const site = defineCollection({
  loader: singleton('src/data/site.yaml'),
  schema: z.object({
    name: z.string(),
    eyebrow: localized,
    intro: localized,
    description: localized, // arama motorları için varsayılan açıklama
    email: z.email(),
    socials: z
      .object({
        itch: optionalUrl,
        steam: optionalUrl,
        github: optionalUrl,
        youtube: optionalUrl,
        linkedin: optionalUrl,
        behance: optionalUrl,
        artstation: optionalUrl,
        sketchfab: optionalUrl,
        discord: optionalUrl,
      })
      .default({}),
    contactText: localized,
  }),
});

const about = defineCollection({
  loader: singleton('src/data/about.yaml'),
  schema: ({ image }) =>
    z.object({
      photo: z.object({ src: image(), alt: localized }),
      bio: localized, // paragraflar boş satırla ayrılır
      school: localizedOptional,
      city: localizedOptional,
      since: z.number().int().optional(), // oyun geliştirmeye başlangıç yılı
      toolbox: z
        .array(
          z.object({
            group: localized,
            items: z.array(
              z.object({ tool: reference('tools'), level: z.enum(['basic']).optional() }),
            ),
          }),
        )
        .default([]),
    }),
});

const stats = defineCollection({
  loader: file('src/data/stats.yaml'),
  schema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('manual'), label: localized, value: z.number(), suffix: text }),
    z.object({
      kind: z.literal('count'),
      label: localized,
      status: z.enum(PROJECT_STATUSES).optional(),
      category: reference('categories').optional(),
      suffix: text,
    }),
    z.object({ kind: z.literal('yearsSince'), label: localized, year: z.number().int(), suffix: text }),
  ]),
});

const downloads = defineCollection({
  loader: file('src/data/downloads.yaml'),
  schema: z.object({
    title: localized,
    description: localizedOptional,
    // Dosyalar src/data/downloads/ altında; sadece bir dil varsa o gösterilir
    files: z
      .object({
        en: z.object({ file: z.string(), pages: z.number().int().positive(), updated: z.coerce.date() }).optional(),
        tr: z.object({ file: z.string(), pages: z.number().int().positive(), updated: z.coerce.date() }).optional(),
      })
      .refine((f) => Boolean(f.en || f.tr), 'En az bir dilde dosya olmalı'),
  }),
});

export const collections = {
  categories,
  tools,
  projects,
  projectTexts,
  certificates,
  site,
  about,
  stats,
  downloads,
};
