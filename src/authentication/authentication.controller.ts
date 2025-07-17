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
    res.cookie('jwt', access_token, { httpOnly: true, secure: false });
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
  getProfile(@Request() req: { user: JwtPayload }): Partial<JwtPayload> {
    const { sub, email, name, role } = req.user;
    return { sub, email, name, role };
  }

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Get('admin-only')
  @Roles('ADMIN')
  GetAdminDate(
    @Request() req: { user: { role: string; email: string; id: number } },
  ) {
    return { message: 'This is admin data', user: req.user };
  }
}
