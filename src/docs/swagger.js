/**
 * swagger.js
 *
 * OpenAPI 3.0 document for the Agro Marketplace backend.
 */

const successEnvelope = (statusCode, message, dataRef) => ({
  allOf: [
    { $ref: '#/components/schemas/ApiSuccess' },
    {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          example: statusCode,
        },
        message: {
          type: 'string',
          example: message,
        },
        data: dataRef
          ? { $ref: dataRef }
          : {
              type: 'object',
              nullable: true,
              example: null,
            },
      },
    },
  ],
});

export const swaggerDocument = {
  openapi: '3.0.3',

  info: {
    title: 'Agro Marketplace API',
    version: '1.0.0',
    description:
      'Backend API for auth, farmer applications, products, orders, and uploads.',
    contact: {
      name: 'Developer Support',
      email: 'support@example.com',
    },
  },

  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],

  tags: [
    {
      name: 'Health',
      description: 'Server and app health endpoints.',
    },
    {
      name: 'Auth',
      description: 'Authentication and session management.',
    },
    {
      name: 'Upload',
      description: 'Profile image upload operations.',
    },
    {
      name: 'Farmers',
      description: 'Farmer profile management.',
    },
    {
      name: 'FarmerRequests',
      description: 'Farmer account request submission.',
    },
    {
      name: 'Products',
      description: 'Farmer product catalog endpoints.',
    },
    {
      name: 'Orders',
      description: 'Buyer and farmer order operations.',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },

      refreshCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },

    schemas: {
      UserAvatar: {
        type: 'object',
        nullable: true,
        properties: {
          url: {
            type: 'string',
            format: 'uri',
            example:
              'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
          },
          publicId: {
            type: 'string',
            example: 'avatars/user_abc123',
          },
        },
      },

      SafeUser: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0e1',
          },
          fullName: {
            type: 'string',
            example: 'Jane Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane@example.com',
          },
          role: {
            type: 'string',
            enum: ['user', 'farmer', 'admin'],
            example: 'user',
          },
          avatar: {
            $ref: '#/components/schemas/UserAvatar',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: 'Jane Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'Str0ng!Pass',
          },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'jane@example.com',
          },
          password: {
            type: 'string',
            example: 'Str0ng!Pass',
          },
        },
      },

      FarmerAddress: {
        type: 'object',
        required: ['city', 'country'],
        properties: {
          street: {
            type: 'string',
            nullable: true,
            example: '123 Farm Rd',
          },
          city: {
            type: 'string',
            example: 'Lahore',
          },
          country: {
            type: 'string',
            example: 'Pakistan',
          },
          zipCode: {
            type: 'string',
            nullable: true,
            example: '54000',
          },
        },
      },

      FarmerLocation: {
        type: 'object',
        required: ['type', 'address'],
        properties: {
          type: {
            type: 'string',
            enum: ['Point'],
            example: 'Point',
          },
          address: {
            $ref: '#/components/schemas/FarmerAddress',
          },
        },
      },

      FarmerCrop: {
        type: 'object',
        required: ['name', 'category', 'season'],
        properties: {
          name: {
            type: 'string',
            example: 'Tomatoes',
          },
          category: {
            type: 'string',
            enum: ['vegetable', 'fruit', 'grain', 'pulse', 'other'],
            example: 'vegetable',
          },
          season: {
            type: 'string',
            enum: ['kharif', 'rabi', 'zaid', 'year-round'],
            example: 'kharif',
          },
          isOrganic: {
            type: 'boolean',
            example: true,
          },
        },
      },

      FarmerImage: {
        type: 'object',
        required: ['url'],
        properties: {
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/farm.jpg',
          },
          caption: {
            type: 'string',
            nullable: true,
            example: 'Farm front view',
          },
        },
      },

      /**
       * FarmerRequest request body.
       *
       * Client can send ONLY these fields.
       */
      FarmerRequestInput: {
        type: 'object',
        additionalProperties: false,
        required: [
          'farmName',
          'farmDescription',
          'location',
          'farmSize',
          'crops',
          'farmImages',
        ],
        properties: {
          farmName: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
            example: 'Green Valley Farm',
          },

          farmDescription: {
            type: 'string',
            minLength: 10,
            maxLength: 1000,
            example: 'Organic vegetables and fruits.',
          },

          location: {
            $ref: '#/components/schemas/FarmerLocation',
          },

          farmSize: {
            type: 'object',
            additionalProperties: false,
            required: ['value', 'unit'],
            properties: {
              value: {
                type: 'number',
                minimum: 0,
                example: 12.5,
              },
              unit: {
                type: 'string',
                enum: ['acres', 'hectares', 'sqft'],
                example: 'acres',
              },
            },
          },

          crops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerCrop',
            },
          },

          farmImages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerImage',
            },
          },
        },
      },

      FarmerRequestResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0e1',
          },

          userId: {
            $ref: '#/components/schemas/SafeUser',
          },

          farmName: {
            type: 'string',
            example: 'Green Valley Farm',
          },

          farmDescription: {
            type: 'string',
            example: 'Organic vegetables and fruits.',
          },

          location: {
            $ref: '#/components/schemas/FarmerLocation',
          },

          farmSize: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
                example: 12.5,
              },
              unit: {
                type: 'string',
                example: 'acres',
              },
            },
          },

          crops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerCrop',
            },
          },

          farmImages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerImage',
            },
          },

          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            example: 'pending',
          },

          reviewedBy: {
            type: 'string',
            nullable: true,
            example: '64a1b2c3d4e5f6a7b8c9d0e2',
          },

          reviewMessage: {
            type: 'string',
            nullable: true,
            example: 'Approved after document verification',
          },

          reviewedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },

          createdAt: {
            type: 'string',
            format: 'date-time',
          },

          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      FarmerUpdateRequest: {
        type: 'object',
        properties: {
          farmName: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
          },
          farmDescription: {
            type: 'string',
            maxLength: 1000,
          },
          location: {
            $ref: '#/components/schemas/FarmerLocation',
          },
          farmSize: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
                minimum: 0,
              },
              unit: {
                type: 'string',
                enum: ['acres', 'hectares', 'sqft'],
              },
            },
          },
          crops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerCrop',
            },
          },
          farmImages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerImage',
            },
          },
        },
      },

      FarmerProfile: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },

          user: {
            $ref: '#/components/schemas/SafeUser',
          },

          farmName: {
            type: 'string',
          },

          farmDescription: {
            type: 'string',
            nullable: true,
          },

          location: {
            $ref: '#/components/schemas/FarmerLocation',
          },

          farmSize: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
              unit: {
                type: 'string',
              },
            },
          },

          crops: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerCrop',
            },
          },

          farmImages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FarmerImage',
            },
          },

          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
          },

          approvalDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },

          rejectionReason: {
            type: 'string',
            nullable: true,
          },

          isVerified: {
            type: 'boolean',
          },

          isActive: {
            type: 'boolean',
          },

          createdAt: {
            type: 'string',
            format: 'date-time',
          },

          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      FarmerRequestReviewInput: {
        type: 'object',
        properties: {
          reviewMessage: {
            type: 'string',
            example: 'Approved after document verification',
          },
        },
      },

      ProductRequest: {
        type: 'object',
        required: ['name', 'price', 'quantity', 'category'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 150,
          },
          description: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
          },
          price: {
            type: 'number',
            minimum: 0,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
          },
          category: {
            type: 'string',
            maxLength: 100,
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            nullable: true,
          },
        },
      },

      UpdateProductRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 150,
          },
          description: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
          },
          price: {
            type: 'number',
            minimum: 0,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
          },
          category: {
            type: 'string',
            maxLength: 100,
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            nullable: true,
          },
        },
      },

      ProductResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          farmer: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
              },
              fullName: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
              },
            },
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          price: {
            type: 'number',
          },
          quantity: {
            type: 'integer',
          },
          category: {
            type: 'string',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      OrderItemRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
          },
        },
      },

      OrderCreateRequest: {
        type: 'object',
        required: ['products'],
        properties: {
          products: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/components/schemas/OrderItemRequest',
            },
          },
        },
      },

      OrderProductItem: {
        type: 'object',
        properties: {
          product: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
          },
          price: {
            type: 'number',
          },
        },
      },

      OrderResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          buyer: {
            type: 'string',
          },
          farmer: {
            type: 'string',
          },
          products: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderProductItem',
            },
          },
          totalAmount: {
            type: 'number',
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'cancelled'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      ProfileImageData: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            format: 'uri',
          },
          user: {
            $ref: '#/components/schemas/SafeUser',
          },
        },
      },

      ApiSuccess: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          statusCode: {
            type: 'integer',
            example: 200,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
            nullable: true,
          },
        },
      },

      ApiError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Something went wrong',
          },
        },
      },

      ValidationErrorDetail: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },

    responses: {
      ValidationError: {
        description: 'Validation failed.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationErrorDetail',
            },
          },
        },
      },

      Unauthorized: {
        description: 'Unauthorized.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },

      Forbidden: {
        description: 'Forbidden.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },

      NotFound: {
        description: 'Not found.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },

      Conflict: {
        description: 'Conflict.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },

      TooManyRequests: {
        description: 'Too many requests.',
        headers: {
          'Retry-After': {
            description: 'Seconds until retry',
            schema: {
              type: 'integer',
            },
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },

      InternalServerError: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },
    },
  },

  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                  example: {
                    success: true,
                    message: 'ok',
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Created',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          409: {
            $ref: '#/components/responses/Conflict',
          },
          429: {
            $ref: '#/components/responses/TooManyRequests',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Signup alias for register',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Created',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          409: {
            $ref: '#/components/responses/Conflict',
          },
          429: {
            $ref: '#/components/responses/TooManyRequests',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'OK',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          429: {
            $ref: '#/components/responses/TooManyRequests',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current profile',
        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: 'OK',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: 'OK',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [{ refreshCookieAuth: [] }],

        responses: {
          200: {
            description: 'OK',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/upload/profile-image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload profile image',
        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: {
                  avatar: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: 'Created',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },

      put: {
        tags: ['Upload'],
        summary: 'Replace profile image',
        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: {
                  avatar: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: 'OK',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },

      delete: {
        tags: ['Upload'],
        summary: 'Delete profile image',
        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: 'OK',
          },
          400: {
            $ref: '#/components/responses/ValidationError',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
          500: {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    /**
     * ================================================================
     * FARMER REQUEST
     * Full CRUD + Admin approval/rejection
     * ================================================================
     */

    '/api/farmer-request': {
      post: {
        tags: ['FarmerRequests'],
        summary: 'Submit a farmer account request',
        description:
          'Allows an authenticated user to submit one request to become a farmer. The authenticated user must have role "user".',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FarmerRequestInput' },
              example: {
                farmName: 'Green Valley Farm',
                farmDescription: 'Organic vegetables and fruits.',
                location: {
                  type: 'Point',
                  address: {
                    street: '123 Farm Rd',
                    city: 'Lahore',
                    country: 'Pakistan',
                    zipCode: '54000',
                  },
                },
                farmSize: { value: 12.5, unit: 'acres' },
                crops: [
                  {
                    name: 'Tomatoes',
                    category: 'vegetable',
                    season: 'kharif',
                    isOrganic: true,
                  },
                ],
                farmImages: [
                  {
                    url: 'https://example.com/farm.jpg',
                    caption: 'Farm front view',
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Farmer request submitted successfully.',
            content: {
              'application/json': {
                schema: successEnvelope(
                  201,
                  'Farmer request submitted',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },

      get: {
        tags: ['FarmerRequests'],
        summary: 'Get all farmer requests (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all farmer requests',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer requests retrieved',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/farmer-request/my': {
      get: {
        tags: ['FarmerRequests'],
        summary: 'Get my farmer requests',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User farmer requests retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer requests retrieved',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/farmer-request/{id}': {
      get: {
        tags: ['FarmerRequests'],
        summary: 'Get farmer request by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Farmer request retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer request retrieved',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },

      put: {
        tags: ['FarmerRequests'],
        summary: 'Update my pending farmer request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FarmerUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Farmer request updated',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer request updated',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },

      delete: {
        tags: ['FarmerRequests'],
        summary: 'Delete my pending farmer request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Farmer request deleted',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer request deleted',
                  null
                ),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/farmer-request/{id}/approve': {
      patch: {
        tags: ['FarmerRequests'],
        summary: 'Approve a farmer request (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FarmerRequestReviewInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Farmer request approved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer request approved',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/farmer-request/{id}/reject': {
      patch: {
        tags: ['FarmerRequests'],
        summary: 'Reject a farmer request (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FarmerRequestReviewInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Farmer request rejected',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Farmer request rejected',
                  '#/components/schemas/FarmerRequestResponse'
                ),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
};