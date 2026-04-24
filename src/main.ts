import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import compression from 'compression';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security and optimization middlewares
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: '*', // Habilita todos los orígenes al ser una API pública
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Star Wars Movies API')
    .setDescription(
      'API de gestión de películas de Star Wars con autenticación JWT',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.getHttpAdapter().get('/', (_req, res: Response) => {
    res.json({
      name: 'Star Wars Movies API',
      version: '1.0',
      docs: '/api/docs',
      endpoints: {
        auth: [
          'POST /auth/register',
          'POST /auth/login',
          'POST /auth/register-admin',
        ],
        users: ['GET /users/me'],
        movies: [
          'GET /movies',
          'GET /movies/:id',
          'POST /movies',
          'PATCH /movies/:id',
          'DELETE /movies/:id',
          'POST /movies/sync',
        ],
      },
    });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
  console.error('Error starting server', err);
});
