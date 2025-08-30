import { SWAGGER_SCHEME } from '@app/constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Cấu hình Swagger API Documentation
 * Tách riêng để dễ quản lý và maintain
 */
export function configSwagger(app: INestApplication): void {
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
      SWAGGER_SCHEME.AUTH, // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    // Cookie Authentication (for refresh tokens)
    .addCookieAuth(SWAGGER_SCHEME.REFRESH, {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token stored in HTTP-only cookie',
    })
    // API Tags
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management operations')
    .addTag('Accounts', 'Account management operations')
    .addTag('Sessions', 'Session management operations')
    .addTag('Collections', 'Bookmark collections management')
    .addTag('Health', 'Health check and system status')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // Include only specific modules if needed
    // include: [AuthModule, UsersModule],

    // Global parameters that apply to all endpoints
    extraModels: [],

    // Deep scan for decorators
    deepScanRoutes: true,
  });

  // Enhanced Swagger UI options
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      // Persist authorization between page refreshes
      persistAuthorization: true,

      // Display request duration
      displayRequestDuration: true,

      // Default models expand depth
      defaultModelsExpandDepth: 2,

      // Default model expand depth
      defaultModelExpandDepth: 2,

      // Show extensions
      showExtensions: true,

      // Show common extensions
      showCommonExtensions: true,

      // Try it out enabled by default
      tryItOutEnabled: true,

      // Filter
      filter: true,

      // Syntax highlighting theme
      syntaxHighlight: {
        theme: 'arta',
      },

      // Custom CSS
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .swagger-ui .auth-wrapper { margin: 20px 0; }
        .swagger-ui .btn.authorize { background-color: #10b981; border-color: #10b981; }
        .swagger-ui .btn.authorize:hover { background-color: #059669; border-color: #059669; }
      `,

      // Custom site title
      customSiteTitle: 'My Collection API Documentation',

      // Custom favicon
      customfavIcon: '/favicon.ico',
    },

    // Custom CSS file
    customCssUrl: undefined,

    // Custom JS files
    customJs: undefined,

    // Explore enabled
    explorer: true,

    // Custom site title
    customSiteTitle: 'My Collection API Docs',
  });

  // Log Swagger URL
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  console.log(`📚 Swagger Documentation: ${baseUrl}/api/docs`);
  console.log(`📄 OpenAPI JSON: ${baseUrl}/api/docs-json`);
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
