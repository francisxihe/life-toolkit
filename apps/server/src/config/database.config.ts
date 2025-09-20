import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
  timezone: '+08:00',
  dateStrings: true,
  autoLoadEntities: true,
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    connectionLimit: 10,
    dateStrings: ['DATE', 'DATETIME'],
  },
});
