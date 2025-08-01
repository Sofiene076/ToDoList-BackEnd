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
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-In-Dto';
import { signUpDto } from './dto/sign-up-dto';
import { User } from 'generated/prisma';
import { AuthenticationGuard } from './authentication.guard';
import { JwtPayload } from './entities/JwtPayload';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
// import { Reflector } from '@nestjs/core';
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
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
    // const { sub, email, name } = req.user;
    const { email, name } = req.user;
    // return { sub, email, name };
    return { email, name };
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
          provider: result.user.provider, // Ajoutez le provider si nécessaire
          // Excluez le mot de passe et autres infos sensibles
        }),
      );

      res.redirect(redirectUrl.toString());
    } catch (error) {
      res.redirect('http://localhost:3001/login?error=oauth_failed');
    }
  }
}
