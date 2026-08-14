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
      ProductCreateInput: {
        type: 'object',
        required: ['name', 'price', 'quantity', 'category'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 150,
            example: 'Organic Tomatoes',
          },
          description: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
            example: 'Fresh organic tomatoes from Green Valley Farm',
          },
          price: {
            type: 'number',
            minimum: 0,
            example: 150.5,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
            example: 100,
          },
          category: {
            type: 'string',
            maxLength: 100,
            example: 'vegetables',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            example: ['https://example.com/tomato.jpg'],
          },
        },
      },

      ProductUpdateInput: {
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
          },
        },
      },

      ProductResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0e3',
          },
          farmer: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
              },
              farmName: {
                type: 'string',
                example: 'Green Valley Farm',
              },
              userId: {
                type: 'string',
              },
            },
          },
          name: {
            type: 'string',
            example: 'Organic Tomatoes',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Fresh organic tomatoes',
          },
          price: {
            type: 'number',
            example: 150.5,
          },
          quantity: {
            type: 'integer',
            example: 100,
          },
          category: {
            type: 'string',
            example: 'vegetables',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            example: ['https://example.com/tomato.jpg'],
          },
          isActive: {
            type: 'boolean',
            example: true,
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

      ProductListResponse: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ProductResponse',
            },
          },
          total: {
            type: 'integer',
            example: 50,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
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
      OrderItemInput: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0e3',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            example: 5,
          },
        },
      },

      OrderCreateInput: {
        type: 'object',
        required: ['products'],
        properties: {
          products: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/components/schemas/OrderItemInput',
            },
            example: [
              { productId: '64a1b2c3d4e5f6a7b8c9d0e3', quantity: 5 },
              { productId: '64a1b2c3d4e5f6a7b8c9d0e4', quantity: 2 },
            ],
          },
        },
      },

      OrderStatusUpdateInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'cancelled'],
            example: 'completed',
          },
        },
      },

      OrderItemResponse: {
        type: 'object',
        properties: {
          product: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string', example: 'Organic Tomatoes' },
              price: { type: 'number', example: 150.5 },
              category: { type: 'string', example: 'vegetables' },
            },
          },
          quantity: {
            type: 'integer',
            example: 5,
          },
          price: {
            type: 'number',
            example: 150.5,
          },
        },
      },

      OrderResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0f1',
          },
          buyer: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string', example: 'Jane Doe' },
              email: { type: 'string', example: 'jane@example.com' },
            },
          },
          farmer: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string', example: 'John Farmer' },
              email: { type: 'string', example: 'john@farm.com' },
            },
          },
          products: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItemResponse',
            },
          },
          totalAmount: {
            type: 'number',
            example: 752.5,
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'cancelled'],
            example: 'pending',
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
      PaginatedUsersResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SafeUser',
            },
          },
          total: {
            type: 'integer',
            example: 100,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
        },
      },

      DashboardStatsResponse: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 150 },
              farmers: { type: 'integer', example: 30 },
            },
          },
          products: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 500 },
            },
          },
          orders: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 200 },
              pending: { type: 'integer', example: 50 },
              completed: { type: 'integer', example: 140 },
              cancelled: { type: 'integer', example: 10 },
            },
          },
          farmerRequests: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 15 },
              approved: { type: 'integer', example: 30 },
              rejected: { type: 'integer', example: 5 },
            },
          },
        },
      },

      ToggleBlockResponse: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            example: '64a1b2c3d4e5f6a7b8c9d0e1',
          },
          isBlocked: {
            type: 'boolean',
            example: true,
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
                schema: successEnvelope(200, 'Farmer request deleted', null),
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
    //PRODUCT APIs
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Text search across name, description, and category',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Products retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Products retrieved',
                  '#/components/schemas/ProductListResponse'
                ),
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },

      post: {
        tags: ['Products'],
        summary: 'Create a product (Farmer)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreateInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created',
            content: {
              'application/json': {
                schema: successEnvelope(
                  201,
                  'Product created',
                  '#/components/schemas/ProductResponse'
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

    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
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
            description: 'Product retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Product retrieved',
                  '#/components/schemas/ProductResponse'
                ),
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },

      put: {
        tags: ['Products'],
        summary: 'Update my product (Farmer)',
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
              schema: { $ref: '#/components/schemas/ProductUpdateInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Product updated',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Product updated',
                  '#/components/schemas/ProductResponse'
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
        tags: ['Products'],
        summary: 'Delete my product (Farmer)',
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
            description: 'Product deleted',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Product deleted', null),
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

    '/api/products/my-products': {
      get: {
        tags: ['Products'],
        summary: 'Get my products (Farmer)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'My products retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'My products retrieved',
                  '#/components/schemas/ProductResponse'
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
    //ORDER APIs
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place an order (Buyer)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderCreateInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Order placed',
            content: {
              'application/json': {
                schema: successEnvelope(
                  201,
                  'Order placed',
                  '#/components/schemas/OrderResponse'
                ),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/orders/my-orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get my orders (Buyer)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Buyer orders retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Orders retrieved',
                  '#/components/schemas/OrderResponse'
                ),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/orders/farmer-orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get orders for my products (Farmer)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Farmer orders retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Orders retrieved',
                  '#/components/schemas/OrderResponse'
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

    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
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
            description: 'Order retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Order retrieved',
                  '#/components/schemas/OrderResponse'
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

      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
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
              schema: { $ref: '#/components/schemas/OrderStatusUpdateInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Order status updated',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Order status updated',
                  '#/components/schemas/OrderResponse'
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

    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all users (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['user', 'farmer', 'admin'] },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by fullName or email',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', default: 'createdAt' },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'Users retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Users retrieved',
                  '#/components/schemas/PaginatedUsersResponse'
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

    '/api/admin/users/{id}/block': {
      patch: {
        tags: ['Admin'],
        summary: 'Toggle block/unblock user (Admin)',
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
            description: 'User block status toggled',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'User block status updated',
                  '#/components/schemas/ToggleBlockResponse'
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

    '/api/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard statistics (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(
                  200,
                  'Dashboard statistics retrieved',
                  '#/components/schemas/DashboardStatsResponse'
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
  },
};
