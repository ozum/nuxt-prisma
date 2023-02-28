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
- Adds prisma client to `event.context` in the server using a Nuxt server middleware.
- (OPTIONAL) Sets default role with `SET ROLE`.
- (OPTIONAL) Reads an attribute from JWT and sets local role accordingly using `SET LOCAL ROLE`.
- (OPTIONAL) Copies JWT data to the current session settings using `set_config()`.
- (OPTIONAL) Allows a RLS implementation with options and presets. (PostgreSQL)
- (OPTIONAL) Provides preset: `supabase`.

## Quick Setup

1. Add `nuxt-prisma` dependency to your project

```bash
npm install --save-dev nuxt-prisma
```

2. Add `nuxt-prisma` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-prisma'],
  prisma: { preset: "supabase" }
});
```

## Usage

**/server/api/item.get.ts**
```ts
export default eventHandler(async (event) => {
  const prisma = event.context.prisma;
  const item = await prisma.item.findUniqueOrThrow({ where: { id } });
}
```

## Options

```ts
export default defineNuxtConfig({
  modules: ['nuxt-prisma'],
  prisma: {
    preset: "",                         // Options preset. Apply multiple options for a specific framework.
    defaultRole: "anon",                // Default database role to use for unauthenticated users. Set by `SET ROLE`.
    contextTokenAttribute: "_token",    // H3 event context attribute to get JWT token. WARNING: The token should be validated previously. This module does not validate JWT token.
    jwtRoleAttribute: "role",           // JWT attribute to get database role from.
    dbConfigName: "request.jwt.claims", // Database config name to assign contents of the JWT token. All decoded data is assigned to this config as a stringified JSON.
  }
});
```

Example above adds a Nuxt server middleware as explained below.

|Option|Value|Description|
|---|---|---|
| **defaultRole** | `anon` | Sets new prisma client's role to `anon` using `SET ROLE anon` |
| **contextTokenAttribute** | `_token` | Reads the JWT token from `event.context._token` and decodes it. |
| **jwtRoleAttribute** | `role` | Reads `role` attribute from JWT token (i.e. `{ ... "role": "authenticated" }`) and sets local role to it's value using `SET LOCAL ROLE authenticated`. |
| **dbConfigName** | `request.jwt.claims` | JWT data is written local config variable using `set_config('request.jwt.claims', '{ ... }', true)` |

**IMPORTANT NOTES:**

You should add a validated JWT to the context previously. JWT is not validated by this module. Storing a non-validated JWT in the context is unsecure.
  


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-prisma/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-prisma

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-prisma.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-prisma

[license-src]: https://img.shields.io/npm/l/nuxt-prisma.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-prisma
