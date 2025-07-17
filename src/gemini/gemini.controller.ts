import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { task } from './entities/task';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post()
  async createTasks(@Body() body: { paragraph: string }): Promise<task[]> {
    try {
      const paragraph = body.paragraph;
      return await this.geminiService.generateToDoList(paragraph);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate tasks: ${errorMessage}`);
    }
  }
}
