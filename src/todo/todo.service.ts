import { Injectable } from '@nestjs/common';
import { Todo } from 'generated/prisma';
import { TaskDto } from './dto/todo';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TodoService {
  constructor(private readonly dataBaseService: DatabaseService) {}

  async createTasks(tasks: TaskDto[], userId: number): Promise<Todo[]> {
    const createTasks = await Promise.all(
      tasks.map((task) =>
        this.dataBaseService.todo.create({
          data: {
            title: task.title,
            status: task.status,
            userId,
          },
        }),
      ),
    );
    return createTasks;
  }

  async getTasksByUserId(userId: number): Promise<Todo[]> {
    return this.dataBaseService.todo.findMany({
      where: { userId },
    });
  }
}
