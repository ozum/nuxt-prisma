import { Prisma, PrismaClient } from "@prisma/client";
import type { Types } from "@prisma/client/runtime/index";
import { defineEventHandler } from "h3";
import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";

// Server middlewares are executed in reverse order. 02 -> 01 -> 00 etc...

const roleRegExp = /^\w+$/;

/** Singleton prisma client. */
let prisma: PrismaClient;

/**
 * Decodes given JWT without verifying.
 *
 * @param token is the token.
 * @returns object data decoded from JWT as a string.
 */
function decodeJwt(token: string): string | undefined {
  return token ? Buffer.from(token.split(".")[1], "base64").toString() : undefined;
}

/**
 * Nuxt middleware function which adds extended prisma RLS client into context.
 * Middleware handlers will run on every request before any other server route.
 */
export default defineEventHandler((event: H3Event) => {
  const options = useRuntimeConfig().public.prisma;
  if (!prisma) {
    prisma = new PrismaClient();
    if (options.defaultRole) prisma.$executeRawUnsafe(`SET ROLE ${options.defaultRole}`);
  }

  // Extend client if JWT should be added to database config and/or local database role should be set.
  if (options.dbConfigName || options.jwtRoleAttribute) {
    const token = event.context[options.contextTokenAttribute];
    const jwtString = decodeJwt(token) ?? "{}";
    const jwtObject = JSON.parse(jwtString);
    const role = jwtObject[options.jwtRoleAttribute] ?? options.defaultRole;

    // Validate role is alpha-numeric single word to prevent SQL injection.
    if (role && !role.match(roleRegExp)) throw new Error("role may contain alpha numeric characters and underscore only.");

    event.context.prisma = prisma.$extends(rlsClient(options.dbConfigName, jwtString, role)) as any as PrismaClient;
  } else {
    event.context.prisma = prisma;
  }
});

/**
 * Creates a Prisma Client Extension with RLS which injects Supabase JWT data
 * into PostgreSQL local config.
 *
 * Queries are wrapped in a transaction, because PostgreSQL connection pool
 * may give different connections for the same session. Transactions overcome
 * this problem.
 *
 * @param jwt JWT object as a string.
 * @returns Prisma Client Extension with RLS
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions
 * @see https://github.com/prisma/prisma-client-extensions/blob/main/row-level-security/script.ts
 * @see https://github.com/prisma/prisma/issues/5128#issuecomment-1059814093
 */
function rlsClient(dbConfigName: string, jwt: string, role?: string): (client: any) => PrismaClient<any, any, any, Types.Extensions.Args> {
  return Prisma.defineExtension((prisma) =>
    // @ts-ignore (Excessive stack depth comparing types...)
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Add data from JWT to database config to make it available to SQL. Also set a local role if configured and provided.
            const queries: any[] = [
              dbConfigName ? prisma.$executeRaw`SELECT set_config(${dbConfigName}, ${jwt}, TRUE)` : undefined,
              role ? prisma.$executeRawUnsafe(`SET LOCAL ROLE ${role}`) : undefined,
              query(args),
            ].filter((q) => q !== undefined);

            const result = await prisma.$transaction(queries);

            // Skip config and role query results and only return result of the user query.
            return result[result.length - 1];
          },
        },
      },
    })
  );
}
