import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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

  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todoService.deleteTask(id);
  }

  @Patch('update/:id')
  async updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Todo> {
    return this.todoService.updateTaskStatus(id, status);
  }
}
