<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Nuxt Prisma
- Package name: nuxt-prisma
- Description: My new Nuxt module
-->

# Nuxt Prisma

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

## Features

<!-- Highlight some of the features your module provide here -->
- Adds prisma client to `event.context` in the server.
- Supports RLS with options and presets.

## Quick Setup

1. Add `nuxt-prisma` dependency to your project

```bash
npm install --save-dev nuxt-prisma
```

2. Add `nuxt-prisma` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-prisma'],
  prisma: { presets: "supabase" }
})
```

That's it! You can now use Prisma in your Nuxt app ✨

## Usage

**/server/api/item.get.ts**
```ts
export default eventHandler(async (event) => {
  const prisma = event.context.prisma;
  const item = await prisma.item.findUniqueOrThrow({ where: { id } });
}
```


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-prisma/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-prisma

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-prisma.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-prisma

[license-src]: https://img.shields.io/npm/l/nuxt-prisma.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-prisma
