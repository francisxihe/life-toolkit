import { ConfigService } from "@nestjs/config";
import { MySqlDriver } from "@mikro-orm/mysql";

export default function mikroOrmConfig(configService: ConfigService) {
  return {
    driver: MySqlDriver,
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    user: configService.get<string>("DB_USERNAME"),
    password: configService.get<string>("DB_PASSWORD"),
    dbName: configService.get<string>("DB_DATABASE"),
    autoLoadEntities: true,
  };
}