import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

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
  async updateProviderProviderId(
    userId: number,
    provider: string,
    providerId: string,
  ): Promise<User> {
    // Changed return type to User
    return this.dataBaseService.user.update({
      // Changed from 'todo' to 'user'
      where: { id: userId }, // Changed from 'userId' to 'id'
      data: { provider, providerId },
    });
  }

  // user.service.ts
  async updateUser(
    id: number,
    data: Prisma.UserUpdateInput & { currentPassword?: string },
  ): Promise<User> {
    try {
      // 1. Get the user first
      const user = await this.findOne(id);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Handle password change if requested
      if (data.password && typeof data.password === 'string') {
        // Validate current password requirements
        if (!data.currentPassword) {
          throw new Error('Current password is required to change password');
        }

        // Verify current password
        if (typeof user.password !== 'string') {
          throw new Error('Password change not allowed for this account');
        }

        const isMatch = await bcrypt.compare(
          data.currentPassword,
          user.password,
        );
        if (!isMatch) {
          throw new Error('Current password is incorrect');
        }

        // Hash and set the new password
        data.password = await bcrypt.hash(data.password, 10);
      }

      // 3. Remove currentPassword from update data as it's not a DB field
      const { currentPassword, ...updateData } = data;

      // 4. Update user
      return await this.dataBaseService.user.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw to let controller handle
    }
  }
}
