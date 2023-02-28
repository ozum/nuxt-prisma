import {
  defineNuxtModule,
  addTemplate,
  createResolver,
  addServerHandler,
} from "@nuxt/kit";
import { defu } from "defu";
import getType from "./utils/get-type";

type PresetName = "supabase";

const PRESETS: Record<PresetName, Omit<ModuleOptions, "preset">> = {
  supabase: {
    defaultRole: "anon",
    contextTokenAttribute: "_token",
    jwtRoleAttribute: "role",
    dbConfigName: "request.jwt.claims",
  },
};

const roleRegExp = /^\w+$/;

export interface ModuleOptions {
  /** Options preset. Apply multiple options for a specific framework. */
  preset?: PresetName;

  /** Default database role to use for unauthenticated users. Set by `SET ROLE`. */
  defaultRole?: string;

  /** H3 event context attribute to get JWT token. WARNING: The token should be validated previously. This module does not validate JWT token. */
  contextTokenAttribute?: string;

  /** JWT attribute to get database role from. */
  jwtRoleAttribute?: string;

  /** Database config name to assign contents of the JWT token. All decoded data is assigned to this config as a stringified JSON. */
  dbConfigName?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-prisma",
    configKey: "prisma",
    compatibility: { nuxt: "^3.0.0" },
  },
  // Default configuration options of the Nuxt module
  defaults: {},

  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const presetOptions = options?.preset ? PRESETS[options.preset] : {};

    nuxt.options.runtimeConfig.public.prisma = defu(
      nuxt.options.runtimeConfig.public.prisma,
      presetOptions,
      options
    );

    const defaultRole = nuxt.options.runtimeConfig.public.prisma.defaultRole;

    // Validate default role is alpha-numeric single word to prevent SQL injection.
    if (defaultRole && !defaultRole.match(roleRegExp))
      throw new Error(
        "defaultRole may contain alpha numeric characters and underscore only."
      );

    // Add types template to .nuxt directory.
    nuxt.hook("app:resolve", (nuxtApp) => {
      addTemplate({
        filename: "types/nuxt-prisma.d.ts",
        getContents: getType,
      });
    });

    // Include added types to the `./nuxt/nuxt.d.ts
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ path: "types/nuxt-prisma.d.ts" });
    });

    // Add prisma middleware to `event.context.prisma`.
    addServerHandler({
      middleware: true,
      handler: resolve("runtime/server/middleware/prisma"),
    });
  },
});
