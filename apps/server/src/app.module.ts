import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import mikroOrmConfig from "./config/database.config";
// import { UsersModule } from "./users/users.module";
// import { AuthModule } from "./auth/auth.module";
import { TodoModule } from "./business/todo/todo.module";
// import { ExpensesModule } from "./expenses/expenses.module";
import { AiModule } from "./business/ai/ai.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MySqlDriver } from "@mikro-orm/mysql";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === "development"
          ? ".env.development.local"
          : ".env.production.local",
    }),
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   imports: [ConfigModule],
    //   useFactory: getDatabaseConfig,
    // }),
    // MikroOrmModule.forRoot({
    //   driver: MySqlDriver,
    //   host: process.env.DB_HOST,
    //   port: process.env.DB_PORT as unknown as number,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   dbName: process.env.DB_NAME,
    //   autoLoadEntities: true,
    // }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        mikroOrmConfig(configService),
    }),
    // UsersModule,
    // AuthModule,
    TodoModule,
    // ExpensesModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
