import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  Get,
  Request,
  Res,
  Req,
  Patch,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-In-Dto';
import { signUpDto } from './dto/sign-up-dto';
import { Prisma, User } from 'generated/prisma';
import { AuthenticationGuard } from './authentication.guard';
import { JwtPayload } from './entities/JwtPayload';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
// import { Reflector } from '@nestjs/core';
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
    // private readonly reflector: Reflector,
  ) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body(new ValidationPipe()) signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; access_token: string; user: User }> {
    const result: { access_token: string; user: User } =
      await this.authenticationService.signIn(signInDto);
    const { access_token, user } = result;
    res.cookie('jwt', access_token, { httpOnly: true, secure: true });
    return { message: 'Login successful', access_token, user };
  }

  @Post('signup')
  async register(
    @Body(new ValidationPipe()) createUserDto: signUpDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    return this.authenticationService.register(createUserDto);
  }
  @UseGuards(AuthenticationGuard)
  @Get('profile')
  getProfile(@Request() req: { user: JwtPayload }): JwtPayload {
    const { sub, email, name, provider = '' } = req.user;
    return { sub, email, name, provider };
  }

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Get('admin-only')
  @Roles('ADMIN')
  GetAdminDate(
    @Request() req: { user: { role: string; email: string; id: number } },
  ) {
    return { message: 'This is admin data', user: req.user };
  }
  // src/auth/auth.controller.ts
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authenticationService.handleOAuthUser(req.user);

      // Créez une URL avec le token ET les infos utilisateur
      const redirectUrl = new URL('http://localhost:3001/auth/oauth-success');

      // Ajoutez le token
      redirectUrl.searchParams.append('token', result.access_token);

      // Ajoutez les infos utilisateur (sérialisées)
      redirectUrl.searchParams.append(
        'user',
        JSON.stringify({
          email: result.user.email,
          name: result.user.name,
          id: result.user.id,
          provider: result.user.provider,
        }),
      );

      res.redirect(redirectUrl.toString());
    } catch (error) {
      res.redirect('http://localhost:3001/login?error=oauth_failed');
    }
  }
  // user.controller.ts
@Patch('profile/:id')
async updateUserProfile(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateData: {
    name?: string;
    email?: string;
    currentPassword?: string;  // For verification
    password?: string;        // New password to set
  },
): Promise<User> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    return await this.userService.updateUser(id, cleanData);
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle different error cases with appropriate HTTP status codes
    if (error.message.includes('Current password is required')) {
      throw new BadRequestException(error.message);
    }
    if (error.message.includes('Current password is incorrect')) {
      throw new UnauthorizedException(error.message);
    }
    if (error.message.includes('User not found')) {
      throw new BadRequestException(error.message);
    }
    if (error.message.includes('Password change not allowed')) {
      throw new BadRequestException(error.message);
    }

    // Fallback to 500 error
    throw new InternalServerErrorException('Failed to update profile');
  }
}
}
