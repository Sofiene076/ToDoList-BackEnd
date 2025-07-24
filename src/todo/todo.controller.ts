import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Todo } from 'generated/prisma';
import { TaskDto } from './dto/todo';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post('createfromexport')
  async createTasks(
    @Body() body: { tasks: TaskDto[]; userId: number },
  ): Promise<Todo[]> {
    const { tasks, userId } = body;
    return this.todoService.createTasks(tasks, userId);
  }

  @Get(':userId')
  async getTasksByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Todo[]> {
    return this.todoService.getTasksByUserId(userId);
  }
}
