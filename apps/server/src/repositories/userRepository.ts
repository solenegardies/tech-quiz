import type { PrismaClient, Prisma } from "@prisma/client";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create<T extends Prisma.UserSelect>(
    data: Prisma.UserCreateInput,
    select?: T,
  ) {
    return this.prisma.user.create({ data, ...(select && { select }) });
  }

  async update<T extends Prisma.UserSelect>(
    id: string,
    data: Prisma.UserUpdateInput,
    select?: T,
  ) {
    return this.prisma.user.update({ where: { id }, data, ...(select && { select }) });
  }

  async count(where?: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return this.prisma.user.findMany({
      ...params,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }
}
