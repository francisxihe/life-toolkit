import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "./entities";
import { GoalService } from "./goal.service";
@Module({
  imports: [TypeOrmModule.forFeature([Goal])],
  // controllers: [GoalController],
  providers: [GoalService],
  exports: [GoalService],
})
export class GoalModule {}
