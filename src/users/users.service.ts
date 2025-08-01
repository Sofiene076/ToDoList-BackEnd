import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly dataBaseService: DatabaseService) {}
  async create(createUserDto: Prisma.UserCreateInput) {
    return this.dataBaseService.user.create({
      data: createUserDto,
    });
  }

  async findAll(role?: 'USER' | 'ADMIN') {
    return this.dataBaseService.user.findMany({
      where: {
        role,
      },
    });
    return this.dataBaseService.user.findMany();
  }

  async findOne(id: number) {
    return this.dataBaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.dataBaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.dataBaseService.user.delete({
      where: {
        id,
      },
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.dataBaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByEmailOrProviderId(email: string, providerId: string) {
    return this.dataBaseService.user.findFirst({
      where: {
        OR: [{ email }, { providerId }],
      },
    });
  }
}
