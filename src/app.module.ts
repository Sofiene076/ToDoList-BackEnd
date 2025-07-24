import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { GeminiService } from './gemini/gemini.service';
import { GeminiController } from './gemini/gemini.controller';
import { GeminiModule } from './gemini/gemini.module';
import { TodoController } from './todo/todo.controller';
import { TodoService } from './todo/todo.service';
import { TodoModule } from './todo/todo.module';
// import { RolesGuard } from './authentication/roles.guard';
// import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthenticationModule,
    GeminiModule,
    TodoModule,
  ],
  controllers: [AppController, GeminiController, TodoController],
  providers: [AppService, GeminiService, TodoService],
})
export class AppModule {}

// import { TypeOrmModule } from '@nestjs/typeorm';

/////// Postgres DataBase configure
// TypeOrmModule.forRoot({
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   password: 'admin',
//   username: 'postgres',
//   entities: [],
//   database: 'demoDb',
//   synchronize: true,
//   logging: true,
// }),
