import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import compression from '@fastify/compress';
import { useContainer } from 'class-validator';
import { camelCase, startCase } from 'lodash';
import * as passport from 'passport';
import { AppModule } from './app.module';

// For development only
const CORS_OPTIONS = {
  origin: ['http://localhost:8080', 'http://localhost:3333'],
  allowedHeaders: [
    'Access-Control-Allow-Origin',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Content-Type',
    'Authorization',
  ],
  exposedHeaders: 'Authorization',
  credentials: true,
  methods: ['GET', 'PUT', 'PATCH', 'OPTIONS', 'POST', 'DELETE'],
};

async function bootstrap() {
  const adapter = new FastifyAdapter();
  adapter.enableCors(CORS_OPTIONS);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(Logger));
  app.use(passport.initialize());

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await app.register(compression);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await app.register(helmet);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Auth microservices')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey
        .toLowerCase()
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        .replace('controller', '')}${startCase(camelCase(methodKey)).replace(
        / /g,
        '',
      )}`;
    },
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      displayOperationId: true,
      docExpansion: 'none',
    },
  });

  const configService = app.get(ConfigService);

  const port = configService.get('PORT');
  const host = configService.get('HOST');

  await app.listen(port || 3000, host);
  console.log(
    `Auth microservice listening on port ${port} on ${await app.getUrl()}`,
  );
}
bootstrap();
