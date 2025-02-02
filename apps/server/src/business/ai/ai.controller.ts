import { Controller, Get, Query } from "@nestjs/common";
import { DeepSeekService } from "./DeepSeek.service";
import { ApiExcludeController } from "@nestjs/swagger";

@ApiExcludeController()
@Controller("ai")
export class AiController {
  constructor(private readonly deepSeekService: DeepSeekService) {}

  @Get("generate")
  async generateText(@Query("prompt") prompt: string): Promise<string | null> {
    return await this.deepSeekService.generateText(prompt);
  }
}
