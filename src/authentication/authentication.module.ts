import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthenticationGuard } from './authentication.guard';
import { RolesGuard } from './roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    AuthenticationGuard,
    RolesGuard,
    GoogleStrategy,
  ],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      validate: (config) => {
        const required = [
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET',
          'GOOGLE_CALLBACK_URL',
        ];
        required.forEach((key) => {
          if (!config[key]) {
            throw new Error(`Missing environment variable: ${key}`);
          }
        });
        return config;
      },
    }),
  ],
  exports: [AuthenticationService, AuthenticationGuard, RolesGuard],
})
export class AuthenticationModule {}
