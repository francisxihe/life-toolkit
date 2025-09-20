import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // 启用 CORS
  app.enableCors({
    origin: true, // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use('api/docs-json', (req: unknown, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // 从配置服务获取端口
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port);
  console.log('========', process.env.NODE_ENV);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
