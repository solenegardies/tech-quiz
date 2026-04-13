// AUTO-GENERATED from Prisma schema — DO NOT EDIT
// Run `pnpm prisma:generate` to regenerate

export const Role = { USER: "USER", ADMIN: "ADMIN" } as const;
export type Role = (typeof Role)[keyof typeof Role];
export const RoleValues = ["USER", "ADMIN"] as const;
