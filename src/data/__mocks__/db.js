// WARN: delete this file later if you don't need it
import { mockDeep } from 'vitest-mock-extended';

const prismaClientMock = mockDeep();

export const db = prismaClientMock;
export const __db = prismaClientMock;

// NOTE: put this anywhere you want to mock prisma
// vi.mock("../src/data/db.js", async () => {
//   const mod = await vi.importActual("../src/data/__mocks__/db.js");
//   return { default: mod.db };
// });
