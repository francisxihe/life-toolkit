import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeepSeekService } from "./DeepSeek.service";
import { AiController } from "./ai.controller";

@Module({
  imports: [],
  controllers: [AiController],
  providers: [DeepSeekService],
  exports: [DeepSeekService],
})
export class AiModule {}
