import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { CreateAuthenticationDto } from './dto/create-authentication.dto';
// import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-In-Dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { signUpDto } from './dto/sign-up-dto';
import { User } from 'generated/prisma';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly UsersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(
    createUserDto: signUpDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    const existingUser = await this.UsersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.UsersService.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role || 'USER',
    });
    if (!user) {
      throw new Error('User registration failed');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async signIn(
    signInDto: SignInDto,
  ): Promise<{ message: string; access_token: string; user: any }> {
    const user = await this.UsersService.findByEmail(signInDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const { password, ...userWithoutPassword } = user;
    return {
      message: '',
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
    }

   
}
