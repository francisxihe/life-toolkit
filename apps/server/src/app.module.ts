import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersModule } from "./users/users.module";
// import { AuthModule } from "./auth/auth.module";
import { TodoModule } from './business/growth/todo/todo.module';
import { TaskModule } from './business/growth/task/task.module';
// import { ExpensesModule } from "./expenses/expenses.module";
import { AiModule } from './business/ai/ai.module';
import { getDatabaseConfig } from './config/database.config';
import { GoalModule } from './business/growth/goal/goal.module';
import { HabitModule } from './business/growth/habit/habit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.development.local' : '.env.production.local',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
    }),
    // UsersModule,
    // AuthModule,
    TodoModule,
    TaskModule,
    GoalModule,
    // ExpensesModule,
    AiModule,
    HabitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
