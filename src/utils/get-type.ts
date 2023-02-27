export default (): string => `
import { PrismaClient } from "@prisma/client";

// Add custom Prisma Client types to the project.
declare module "h3" {
  interface H3EventContext {
    prisma: PrismaClient;
  }
}

export type Stub = number;
`;
