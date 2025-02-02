import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  });

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle("Home Manager API")
    .setDescription("Home Manager 应用程序的 API 文档")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  app.use("api/docs-json", (req: unknown, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(document);
  });

  // 从配置服务获取端口
  const configService = app.get(ConfigService);
  const port = configService.get("PORT");

  await app.listen(port);
  console.log("========", process.env.NODE_ENV);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/api/docs`
  );
}
bootstrap();
