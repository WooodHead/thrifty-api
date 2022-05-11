import { NestFactory, Reflector } from '@nestjs/core';
// import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
// import * as csurf from 'csurf';
import helmet from 'helmet';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ClassSerializerInterceptor, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { SwaggerCustomOptions } from './global';
import { ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
const configService = new ConfigService(configuration);

async function bootstrap() {
  const whitelist = ['http://localhost:3000', 'https://api-thrifty.herokuapp.com'];
  const corsOptions: CorsOptions = {
    credentials: true,
    methods: ['GET', 'DELETE', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
    origin: (requestOrigin: string, callback) => {
      if (whitelist.indexOf(requestOrigin) !== -1 || !requestOrigin) {
        callback(null, true);
      } else {
        callback(new HttpException('Not allowed by CORS', HttpStatus.FORBIDDEN))
      }
    },
  };

  // const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  app.use(compression());
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  // app.use(csurf({
  //   cookie: {
  //     signed: false,
  //     httpOnly: true,
  //     secure: false,
  //     sameSite: 'lax',
  //   }
  // }));
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger Setup
  const config = new DocumentBuilder()
    .addBasicAuth()
    .addBearerAuth()
    .setTitle('Inventory App API')
    .setDescription('A simple API for managing inventory')
    .setVersion('1.0')
    .addTag('inventory')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Inventory App API Docs',
    customfavIcon: '',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true
    }
  }

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api-docs', app, document, customOptions);

  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
};

bootstrap();
