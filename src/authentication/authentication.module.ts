import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthenticationGuard } from './authentication.guard';
import { RolesGuard } from './roles.guard';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthenticationGuard, RolesGuard],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [AuthenticationService, AuthenticationGuard, RolesGuard],
})
export class AuthenticationModule {}
