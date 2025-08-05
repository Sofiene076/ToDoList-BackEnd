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

    // Handle OAuth users (no password)
    if (!user.password) {
      throw new UnauthorizedException('Please sign in with Google');
    }

    // Handle email/password users
    const isMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const { password, ...userWithoutPassword } = user;
    return {
      message: '',
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
  }

  async handleOAuthUser(profile: {
    email: string;
    name: string;
    provider: string; // This comes from GoogleStrategy
    providerId: string;
  }): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    // 1. Find or create user
    let user = await this.UsersService.findByEmailOrProviderId(
      profile.email,
      profile.providerId,
    );

    if (!user) {
      user = await this.UsersService.create({
        email: profile.email,
        name: profile.name,
        provider: profile.provider, // Make sure this is saved
        providerId: profile.providerId,
        role: 'USER',
        password: null,
      });
    }

    // 2. Verify the user has provider data
    if (!user.provider) {
      // Update existing user if provider was missing
      user = await this.UsersService.updateProviderProviderId(
        user.id,
        profile.provider,
        profile.providerId,
      );
    }

    // 3. Generate JWT - use user.provider, not profile.provider
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      provider: user.provider, // Use the user's provider
      providerId: user.providerId,
    };

    const { password, ...userWithoutPassword } = user;
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
  }
}
