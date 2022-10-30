import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions
} from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { SwaggerCustomOptions } from './global';
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

  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  app.use(compression());
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
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
    .addCookieAuth('cookieAuth', { type: 'http', in: 'signedCookies', scheme: 'Bearer', name: 'jit' })
    .addServer('https://api-thrifty.herokuapp.com/v1', 'Main (production) Server')
    .addServer('http://localhost:3000/v1', 'Localhost Server')
    .setContact('Lekan Adetunmbi', 'https://pollaroid.net', 'greazleay@aol.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setTitle('Thrifty API')
    .setDescription('A Fictional Financial Services Provider which offers traditonal financial services and some other value-added services')
    .setVersion('1.0')
    .addTag('Thrifty')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Thrifty API Docs',
    customfavIcon: 'NONE',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true
    }
  }

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api-docs', app, document, customOptions);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  await app.listen(configService.get('PORT') ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
};

bootstrap();
