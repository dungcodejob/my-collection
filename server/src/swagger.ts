import { FEATURE_KEY, SWAGGER_SCHEME } from '@app/constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';
import { NextFunction, Request, Response } from 'express';
import { AppConfig } from './core/configs/app.config';

const apiDocumentationCredentials = {
  name: 'admin',
  pass: 'admin',
};

/**
 * Cấu hình Swagger API Documentation
 * Tách riêng để dễ quản lý và maintain
 */
export async function swagger(
  app: INestApplication,
  appConfig: AppConfig,
): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('My Collection API')
    .setDescription(`## My Collection API Documentation`)
    .setVersion('1.0.0')
    .setContact(
      'Development Team',
      'https://github.com/dungcodejob/my-collection',
      'dungcodejob@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    // JWT Bearer Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      SWAGGER_SCHEME.JWT_AUTH, // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    // Cookie Authentication (for refresh tokens)
    .addCookieAuth(SWAGGER_SCHEME.REFRESH, {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token stored in HTTP-only cookie',
    })
    // API Tags
    .addTag(FEATURE_KEY.AUTH, 'Authentication and authorization endpoints')
    .addTag(FEATURE_KEY.USER, 'User management operations')
    .addTag(FEATURE_KEY.COLLECTION, 'Bookmark collections management')
    .addTag(FEATURE_KEY.HEALTH, 'Health check and system status')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // Include only specific modules if needed
    // include: [AuthModule, UsersModule],

    // Global parameters that apply to all endpoints
    extraModels: [],

    // Deep scan for decorators
    deepScanRoutes: true,
  });

  const swaggerOptions: SwaggerUiOptions = {
    persistAuthorization: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    filter: true,
    syntaxHighlight: {
      theme: 'arta',
    },
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .swagger-ui .auth-wrapper { margin: 20px 0; }
        .swagger-ui .btn.authorize { background-color: #10b981; border-color: #10b981; }
        .swagger-ui .btn.authorize:hover { background-color: #059669; border-color: #059669; }
      `,
    customSiteTitle: 'My Collection API Documentation',
    customfavIcon: '/favicon.ico',
  };

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.use(
    '/api/docs',
    (req: Request, res: Response, next: NextFunction) => {
      swaggerAuthMiddleware(
        req,
        res,
        next,
        httpAdapter.getType(),
        appConfig.testing,
      );
    },
  );

  // if (appConfig.testing) {
  //   try {
  //     const loginResult = await app.get(AuthService).login(
  //       {
  //         emailOrUsername: appConfig.account.username,
  //         password: appConfig.account.password,
  //       },
  //       {
  //         deviceType: 'Desktop Chrome',
  //         ipAddress: '127.0.0.1',
  //         userAgent:
  //           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  //         location: 'unknown',
  //       },
  //     );

  //     swaggerOptions.authAction = {
  //       'access-token': {
  //         name: 'access-token',
  //         schema: {
  //           type: 'apiKey',
  //           in: 'header',
  //           name: 'authorization',
  //         },
  //         value: `Bearer ${loginResult.accessToken}`,
  //       },
  //     };

  //     console.log(
  //       `✅ Swagger auto-login successful for ${appConfig.account.username}`,
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // Enhanced Swagger UI options
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions,
    explorer: true,
    customSiteTitle: 'My Collection API Docs',
  });
}

/**
 * Export OpenAPI document as JSON
 * Useful for generating client SDKs
 */
export function setupSwaggerJson(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('My Collection API')
    .setDescription('My Collection API for generating client SDKs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup JSON endpoint
  SwaggerModule.setup('api/docs-json', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml',
  });
}

function swaggerAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  type: string,
  isTesting: boolean,
) {
  function parseAuthHeader(input: string): { name: string; pass: string } {
    const [, encodedPart] = input.split(' ');

    const buff = Buffer.from(encodedPart, 'base64');
    const text = buff.toString('ascii');
    const [name, pass] = text.split(':');

    return { name, pass };
  }

  function unauthorizedResponse(): void {
    if (type === 'fastify') {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic');
    } else {
      res.status(401);
      res.set('WWW-Authenticate', 'Basic');
    }

    next();
  }

  if (!isTesting) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return unauthorizedResponse();
    }

    const credentials = parseAuthHeader(authHeader);

    if (
      credentials?.name !== apiDocumentationCredentials.name ||
      credentials?.pass !== apiDocumentationCredentials.pass
    ) {
      return unauthorizedResponse();
    }
  }

  next();
}
