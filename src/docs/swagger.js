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
      'Backend API for auth, farmer applications, products, orders, cart, buyer profiles, and admin operations.',
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
    { name: 'Health', description: 'Server and app health endpoints.' },
    { name: 'Auth', description: 'Authentication and session management.' },
    { name: 'Upload', description: 'Profile image upload operations.' },
    { name: 'Farmers', description: 'Farmer profile management.' },
    { name: 'FarmerRequests', description: 'Farmer account request submission and review.' },
    { name: 'Products', description: 'Farmer product catalog endpoints.' },
    { name: 'Cart', description: 'Shopping cart operations for guests and authenticated users.' },
    { name: 'Orders', description: 'Buyer and farmer order operations.' },
    { name: 'BuyerProfile', description: 'Buyer profile and address management.' },
    { name: 'Admin', description: 'Admin dashboard and user management.' },
    { name: 'superAdmin', description: 'superAdmin admin management operations.' },
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
            example: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
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
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          fullName: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['user', 'farmer', 'admin', 'superAdmin', 'buyer', 'visitor'], example: 'user' },
          avatar: { $ref: '#/components/schemas/UserAvatar' },
          isActive: { type: 'boolean', example: true },
          isBlocked: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', minLength: 3, maxLength: 50, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, example: 'Str0ng!Pass' },
          role: { type: 'string', enum: ['user', 'farmer', 'buyer'], example: 'user' },
          phone: { type: 'string', example: '+923001234567' },
          address: { type: 'string', example: '123 Farm Rd, Lahore' },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'Str0ng!Pass' },
        },
      },

      ChangePasswordInput: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', example: 'OldPass123!' },
          newPassword: { type: 'string', minLength: 8, example: 'NewPass456!' },
        },
      },

      SuperAdminRegisterInput: {
        type: 'object',
        required: ['fullName', 'email', 'password', 'secretKey'],
        properties: {
          fullName: { type: 'string', minLength: 3, maxLength: 50, example: 'Super Admin' },
          email: { type: 'string', format: 'email', example: 'super@admin.com' },
          password: { type: 'string', minLength: 8, example: 'SuperSecret1!' },
          secretKey: { type: 'string', example: 'my-super-secret-key-123' },
        },
      },

      VisitorRegisterInput: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', minLength: 3, maxLength: 50, example: 'Guest User' },
          email: { type: 'string', format: 'email', example: 'guest@example.com' },
          password: { type: 'string', minLength: 8, example: 'GuestPass1!' },
        },
      },

      VisitorLoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'guest@example.com' },
          password: { type: 'string', example: 'GuestPass1!' },
        },
      },

      VisitorChangePasswordInput: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'OldPass123!' },
          newPassword: { type: 'string', minLength: 8, example: 'NewPass456!' },
        },
      },

      FarmerAddress: {
        type: 'object',
        required: ['city', 'country'],
        properties: {
          street: { type: 'string', nullable: true, example: '123 Farm Rd' },
          city: { type: 'string', example: 'Lahore' },
          country: { type: 'string', example: 'Pakistan' },
          zipCode: { type: 'string', nullable: true, example: '54000' },
        },
      },

      FarmerLocation: {
        type: 'object',
        required: ['type', 'address'],
        properties: {
          type: { type: 'string', enum: ['Point'], example: 'Point' },
          address: { $ref: '#/components/schemas/FarmerAddress' },
        },
      },

      FarmerCrop: {
        type: 'object',
        required: ['name', 'category', 'season'],
        properties: {
          name: { type: 'string', example: 'Tomatoes' },
          category: { type: 'string', enum: ['vegetable', 'fruit', 'grain', 'pulse', 'other'], example: 'vegetable' },
          season: { type: 'string', enum: ['kharif', 'rabi', 'zaid', 'year-round'], example: 'kharif' },
          isOrganic: { type: 'boolean', example: true },
        },
      },

      FarmerImage: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri', example: 'https://example.com/farm.jpg' },
          caption: { type: 'string', nullable: true, example: 'Farm front view' },
        },
      },

      FarmerRequestInput: {
        type: 'object',
        additionalProperties: false,
        required: ['farmName', 'farmDescription', 'location', 'farmSize', 'crops', 'farmImages'],
        properties: {
          farmName: { type: 'string', minLength: 3, maxLength: 100, example: 'Green Valley Farm' },
          farmDescription: { type: 'string', minLength: 10, maxLength: 1000, example: 'Organic vegetables and fruits.' },
          location: { $ref: '#/components/schemas/FarmerLocation' },
          farmSize: {
            type: 'object',
            additionalProperties: false,
            required: ['value', 'unit'],
            properties: {
              value: { type: 'number', minimum: 0, example: 12.5 },
              unit: { type: 'string', enum: ['acres', 'hectares', 'sqft'], example: 'acres' },
            },
          },
          crops: { type: 'array', items: { $ref: '#/components/schemas/FarmerCrop' } },
          farmImages: { type: 'array', items: { $ref: '#/components/schemas/FarmerImage' } },
        },
      },

      FarmerRequestResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          userId: { $ref: '#/components/schemas/SafeUser' },
          farmName: { type: 'string', example: 'Green Valley Farm' },
          farmDescription: { type: 'string', example: 'Organic vegetables and fruits.' },
          location: { $ref: '#/components/schemas/FarmerLocation' },
          farmSize: {
            type: 'object',
            properties: {
              value: { type: 'number', example: 12.5 },
              unit: { type: 'string', example: 'acres' },
            },
          },
          crops: { type: 'array', items: { $ref: '#/components/schemas/FarmerCrop' } },
          farmImages: { type: 'array', items: { $ref: '#/components/schemas/FarmerImage' } },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
          reviewedBy: { type: 'string', nullable: true, example: '64a1b2c3d4e5f6a7b8c9d0e2' },
          reviewMessage: { type: 'string', nullable: true, example: 'Approved after document verification' },
          reviewedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      FarmerUpdateRequest: {
        type: 'object',
        properties: {
          farmName: { type: 'string', minLength: 3, maxLength: 100 },
          farmDescription: { type: 'string', maxLength: 1000 },
          location: { $ref: '#/components/schemas/FarmerLocation' },
          farmSize: {
            type: 'object',
            properties: {
              value: { type: 'number', minimum: 0 },
              unit: { type: 'string', enum: ['acres', 'hectares', 'sqft'] },
            },
          },
          crops: { type: 'array', items: { $ref: '#/components/schemas/FarmerCrop' } },
          farmImages: { type: 'array', items: { $ref: '#/components/schemas/FarmerImage' } },
        },
      },

      FarmerRequestReviewInput: {
        type: 'object',
        properties: {
          reviewMessage: { type: 'string', example: 'Approved after document verification' },
        },
      },

      FarmerProfile: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { $ref: '#/components/schemas/SafeUser' },
          farmName: { type: 'string' },
          farmDescription: { type: 'string', nullable: true },
          location: { $ref: '#/components/schemas/FarmerLocation' },
          farmSize: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              unit: { type: 'string' },
            },
          },
          crops: { type: 'array', items: { $ref: '#/components/schemas/FarmerCrop' } },
          farmImages: { type: 'array', items: { $ref: '#/components/schemas/FarmerImage' } },
          isVerified: { type: 'boolean' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      ProductCreateInput: {
        type: 'object',
        required: ['name', 'price', 'quantity', 'category'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 150, example: 'Organic Tomatoes' },
          description: { type: 'string', maxLength: 2000, nullable: true, example: 'Fresh organic tomatoes from Green Valley Farm' },
          price: { type: 'number', minimum: 0, example: 150.5 },
          quantity: { type: 'integer', minimum: 0, example: 100 },
          category: { type: 'string', maxLength: 100, example: 'vegetables' },
          images: { type: 'array', items: { type: 'string', format: 'uri' }, example: ['https://example.com/tomato.jpg'] },
        },
      },

      ProductUpdateInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 150 },
          description: { type: 'string', maxLength: 2000, nullable: true },
          price: { type: 'number', minimum: 0 },
          quantity: { type: 'integer', minimum: 0 },
          category: { type: 'string', maxLength: 100 },
          images: { type: 'array', items: { type: 'string', format: 'uri' } },
        },
      },

      ProductResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e3' },
          farmer: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              farmName: { type: 'string', example: 'Green Valley Farm' },
              userId: { type: 'string' },
            },
          },
          name: { type: 'string', example: 'Organic Tomatoes' },
          description: { type: 'string', nullable: true, example: 'Fresh organic tomatoes' },
          price: { type: 'number', example: 150.5 },
          quantity: { type: 'integer', example: 100 },
          category: { type: 'string', example: 'vegetables' },
          images: { type: 'array', items: { type: 'string', format: 'uri' }, example: ['https://example.com/tomato.jpg'] },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      ProductListResponse: {
        type: 'object',
        properties: {
          products: { type: 'array', items: { $ref: '#/components/schemas/ProductResponse' } },
          total: { type: 'integer', example: 50 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
        },
      },

      OrderItemInput: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e3' },
          quantity: { type: 'integer', minimum: 1, example: 5 },
        },
      },

      OrderCreateInput: {
        type: 'object',
        required: ['products'],
        properties: {
          products: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/OrderItemInput' },
            example: [
              { productId: '64a1b2c3d4e5f6a7b8c9d0e3', quantity: 5 },
              { productId: '64a1b2c3d4e5f6a7b8c9d0e4', quantity: 2 },
            ],
          },
          preferredDate: { type: 'string', format: 'date-time', example: '2026-08-25T10:00:00Z' },
        },
      },

      OrderStatusUpdateInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], example: 'completed' },
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
              images: { type: 'array', items: { type: 'string' } },
            },
          },
          quantity: { type: 'integer', example: 5 },
          price: { type: 'number', example: 150.5 },
        },
      },

      OrderResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f1' },
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
              farmName: { type: 'string', example: 'Green Valley Farm' },
              userId: { type: 'string' },
            },
          },
          products: { type: 'array', items: { $ref: '#/components/schemas/OrderItemResponse' } },
          totalAmount: { type: 'number', example: 752.5 },
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], example: 'pending' },
          deliveryDetails: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      OrderTrackingResponse: {
        type: 'object',
        properties: {
          orderId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f1' },
          status: { type: 'string', example: 'pending' },
          totalAmount: { type: 'number', example: 752.5 },
          createdAt: { type: 'string', format: 'date-time' },
          deliveryDetails: { type: 'object' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Organic Tomatoes' },
                quantity: { type: 'integer', example: 5 },
                price: { type: 'number', example: 150.5 },
              },
            },
          },
        },
      },

      CartItem: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f2' },
          productId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e3' },
          farmerId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e4' },
          farmerName: { type: 'string', example: 'Green Valley Farm' },
          productName: { type: 'string', example: 'Organic Tomatoes' },
          quantity: { type: 'integer', example: 5 },
          unitPrice: { type: 'number', example: 150.5 },
          addedAt: { type: 'string', format: 'date-time' },
        },
      },

      CartSession: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f3' },
          userId: { type: 'string', nullable: true, example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          sessionId: { type: 'string', nullable: true, example: '550e8400-e29b-41d4-a716-446655440000' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      CartAddInput: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e3' },
          quantity: { type: 'integer', minimum: 1, example: 5 },
        },
      },

      CartUpdateInput: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1, example: 3 },
        },
      },

      CartMergeInput: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        },
      },

      BuyerAddress: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f4' },
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'Lahore' },
          state: { type: 'string', example: 'Punjab' },
          country: { type: 'string', example: 'Pakistan' },
          zipCode: { type: 'string', example: '54000' },
          landmark: { type: 'string', nullable: true, example: 'Near City Hospital' },
          isDefault: { type: 'boolean', example: true },
        },
      },

      BuyerAddressInput: {
        type: 'object',
        required: ['street', 'city', 'state', 'country', 'zipCode'],
        properties: {
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'Lahore' },
          state: { type: 'string', example: 'Punjab' },
          country: { type: 'string', example: 'Pakistan' },
          zipCode: { type: 'string', example: '54000' },
          landmark: { type: 'string', example: 'Near City Hospital' },
          isDefault: { type: 'boolean', example: false },
        },
      },

      BuyerProfile: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f5' },
          userId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          phone: { type: 'string', example: '+923001234567' },
          alternatePhone: { type: 'string', nullable: true, example: '+923009876543' },
          deliveryPreferences: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['home_delivery', 'pickup'], example: 'home_delivery' },
              timeSlot: { type: 'string', example: 'morning' },
              instructions: { type: 'string', example: 'Leave at front door' },
            },
          },
          savedAddresses: { type: 'array', items: { $ref: '#/components/schemas/BuyerAddress' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      BuyerProfileInput: {
        type: 'object',
        properties: {
          phone: { type: 'string', example: '+923001234567' },
          alternatePhone: { type: 'string', example: '+923009876543' },
          deliveryPreferences: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['home_delivery', 'pickup'], example: 'home_delivery' },
              timeSlot: { type: 'string', example: 'morning' },
              instructions: { type: 'string', example: 'Leave at front door' },
            },
          },
        },
      },

      AdminCreateInput: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', minLength: 3, maxLength: 50, example: 'Admin User' },
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          password: { type: 'string', minLength: 8, example: 'AdminPass1!' },
          phone: { type: 'string', example: '+923001234567' },
          address: { type: 'string', example: '123 Admin St, Lahore' },
        },
      },

      AdminResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0f6' },
          fullName: { type: 'string', example: 'Admin User' },
          email: { type: 'string', example: 'admin@example.com' },
          role: { type: 'string', example: 'admin' },
          isActive: { type: 'boolean', example: true },
          createdBy: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      AdminListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/AdminResponse' } },
          total: { type: 'integer', example: 10 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 1 },
        },
      },

      PaginatedUsersResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/SafeUser' } },
          total: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
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
              buyers: { type: 'integer', example: 80 },
              admins: { type: 'integer', example: 10 },
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
          userId: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
          isBlocked: { type: 'boolean', example: true },
        },
      },

      ProfileImageData: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string', format: 'uri' },
          user: { $ref: '#/components/schemas/SafeUser' },
        },
      },

      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object', nullable: true },
        },
      },

      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },

      ValidationErrorDetail: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'array', items: { type: 'string' } },
                message: { type: 'string' },
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
            schema: { $ref: '#/components/schemas/ValidationErrorDetail' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      NotFound: {
        description: 'Not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      Conflict: {
        description: 'Conflict.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      TooManyRequests: {
        description: 'Too many requests.',
        headers: {
          'Retry-After': {
            description: 'Seconds until retry',
            schema: { type: 'integer' },
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
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
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                  example: { success: true, message: 'ok' },
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
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
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
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/superadmin-register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a superAdmin (requires secret key)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuperAdminRegisterInput' },
            },
          },
        },
        responses: {
          201: { description: 'SuperAdmin created' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
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
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordInput' },
            },
          },
        },
        responses: {
          200: { description: 'Password changed' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [{ refreshCookieAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/visitor/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register as a visitor (guest user)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VisitorRegisterInput' },
            },
          },
        },
        responses: {
          201: { description: 'Visitor registered' },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/visitor/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login as a visitor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VisitorLoginInput' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/auth/visitor/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change visitor password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VisitorChangePasswordInput' },
            },
          },
        },
        responses: {
          200: { description: 'Password changed' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
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
                  avatar: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
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
                  avatar: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Upload'],
        summary: 'Delete profile image',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/farmer-request': {
      post: {
        tags: ['FarmerRequests'],
        summary: 'Submit a farmer account request',
        description: 'Allows an authenticated user to submit one request to become a farmer. The authenticated user must have role "user".',
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
                crops: [{ name: 'Tomatoes', category: 'vegetable', season: 'kharif', isOrganic: true }],
                farmImages: [{ url: 'https://example.com/farm.jpg', caption: 'Farm front view' }],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Farmer request submitted successfully.',
            content: {
              'application/json': {
                schema: successEnvelope(201, 'Farmer request submitted', '#/components/schemas/FarmerRequestResponse'),
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
                schema: successEnvelope(200, 'Farmer requests retrieved', '#/components/schemas/FarmerRequestResponse'),
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
      put: {
        tags: ['FarmerRequests'],
        summary: 'Update my pending farmer request',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'Farmer request updated', '#/components/schemas/FarmerRequestResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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

    '/api/farmer/me': {
      get: {
        tags: ['Farmers'],
        summary: 'Get my farmer profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Farmer profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Farmer profile retrieved', '#/components/schemas/FarmerProfile'),
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

    '/api/farmer/profile': {
      put: {
        tags: ['Farmers'],
        summary: 'Update my farmer profile',
        security: [{ bearerAuth: [] }],
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
            description: 'Farmer profile updated',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Farmer profile updated', '#/components/schemas/FarmerProfile'),
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

    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Text search across name, description, and category' },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Products retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Products retrieved', '#/components/schemas/ProductListResponse'),
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
                schema: successEnvelope(201, 'Product created', '#/components/schemas/ProductResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Product retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Product retrieved', '#/components/schemas/ProductResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'Product updated', '#/components/schemas/ProductResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'My products retrieved', '#/components/schemas/ProductResponse'),
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

    '/api/cart': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        description: 'Adds a product to the cart. Works for both authenticated users and guest sessions.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartAddInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Item added to cart',
            content: {
              'application/json': {
                schema: successEnvelope(201, 'Item added to cart', '#/components/schemas/CartSession'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      get: {
        tags: ['Cart'],
        summary: 'Get cart contents',
        description: 'Retrieves the current cart for authenticated user or guest session.',
        responses: {
          200: {
            description: 'Cart retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Cart retrieved', '#/components/schemas/CartSession'),
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart',
        description: 'Removes all items from the cart and clears the session cookie.',
        responses: {
          200: {
            description: 'Cart cleared',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Cart cleared', null),
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/cart/{itemId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartUpdateInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cart item updated',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Cart item updated', '#/components/schemas/CartSession'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Item removed from cart',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Item removed from cart', '#/components/schemas/CartSession'),
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/cart/merge': {
      post: {
        tags: ['Cart'],
        summary: 'Merge guest cart into user cart',
        description: 'Transfers all items from a guest session cart to the authenticated user cart. Requires authentication.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartMergeInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Guest cart merged successfully',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Guest cart merged successfully', '#/components/schemas/CartSession'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

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
                schema: successEnvelope(201, 'Order placed', '#/components/schemas/OrderResponse'),
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

    '/api/orders/track': {
      get: {
        tags: ['Orders'],
        summary: 'Track order by email and order ID',
        description: 'Public endpoint for tracking orders without authentication. Rate limited.',
        parameters: [
          { name: 'email', in: 'query', required: true, schema: { type: 'string', format: 'email' }, example: 'jane@example.com' },
          { name: 'orderId', in: 'query', required: true, schema: { type: 'string' }, example: '64a1b2c3d4e5f6a7b8c9d0f1' },
        ],
        responses: {
          200: {
            description: 'Tracking info retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Tracking info retrieved', '#/components/schemas/OrderTrackingResponse'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' },
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
                schema: successEnvelope(200, 'Orders retrieved', '#/components/schemas/OrderResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
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
                schema: successEnvelope(200, 'Orders retrieved', '#/components/schemas/OrderResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Order retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Order retrieved', '#/components/schemas/OrderResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'Order status updated', '#/components/schemas/OrderResponse'),
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

    '/api/buyer/profile': {
      post: {
        tags: ['BuyerProfile'],
        summary: 'Create or update buyer profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BuyerProfileInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Buyer profile saved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Buyer profile saved', '#/components/schemas/BuyerProfile'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      get: {
        tags: ['BuyerProfile'],
        summary: 'Get buyer profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Buyer profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Buyer profile retrieved', '#/components/schemas/BuyerProfile'),
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

    '/api/buyer/addresses': {
      post: {
        tags: ['BuyerProfile'],
        summary: 'Add a new address',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BuyerAddressInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Address added',
            content: {
              'application/json': {
                schema: successEnvelope(201, 'Address added', '#/components/schemas/BuyerProfile'),
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      get: {
        tags: ['BuyerProfile'],
        summary: 'Get all saved addresses',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Addresses retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Addresses retrieved', '#/components/schemas/BuyerAddress'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/buyer/addresses/{id}': {
      put: {
        tags: ['BuyerProfile'],
        summary: 'Update an address',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BuyerAddressInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Address updated',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Address updated', '#/components/schemas/BuyerProfile'),
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
        tags: ['BuyerProfile'],
        summary: 'Delete an address',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Address deleted',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Address deleted', '#/components/schemas/BuyerProfile'),
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

    '/api/buyer/addresses/{id}/default': {
      patch: {
        tags: ['BuyerProfile'],
        summary: 'Set default address',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Default address set',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Default address set', '#/components/schemas/BuyerProfile'),
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

    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all users (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'farmer', 'admin'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by fullName or email' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Users retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Users retrieved', '#/components/schemas/PaginatedUsersResponse'),
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
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'User block status toggled',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'User block status updated', '#/components/schemas/ToggleBlockResponse'),
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
                schema: successEnvelope(200, 'Dashboard statistics retrieved', '#/components/schemas/DashboardStatsResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'Get all orders (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'completed', 'cancelled'] } },
        ],
        responses: {
          200: {
            description: 'All orders retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'All orders retrieved', '#/components/schemas/OrderResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/admin/orders/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get order by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Order retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Order retrieved', '#/components/schemas/OrderResponse'),
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

    '/api/admin/buyers': {
      get: {
        tags: ['Admin'],
        summary: 'Get all buyers (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by fullName or email' },
        ],
        responses: {
          200: {
            description: 'Buyers retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Buyers retrieved', '#/components/schemas/PaginatedUsersResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/admin/farmer-requests': {
      get: {
        tags: ['Admin'],
        summary: 'Get all farmer requests (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Farmer requests retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Farmer requests retrieved', '#/components/schemas/FarmerRequestResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/admin/farmer-requests/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get farmer request by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Farmer request retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Farmer request retrieved', '#/components/schemas/FarmerRequestResponse'),
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

    '/api/admin/farmer-requests/{id}/approve': {
      patch: {
        tags: ['Admin'],
        summary: 'Approve a farmer request (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'Farmer request approved', '#/components/schemas/FarmerRequestResponse'),
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

    '/api/admin/farmer-requests/{id}/reject': {
      patch: {
        tags: ['Admin'],
        summary: 'Reject a farmer request (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
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
                schema: successEnvelope(200, 'Farmer request rejected', '#/components/schemas/FarmerRequestResponse'),
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

    '/api/superadmin/admins': {
      get: {
        tags: ['superAdmin'],
        summary: 'Get all admins (superAdmin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Admins retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Admins retrieved', '#/components/schemas/AdminListResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        tags: ['superAdmin'],
        summary: 'Create a new admin (superAdmin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminCreateInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Admin created',
            content: {
              'application/json': {
                schema: successEnvelope(201, 'Admin created successfully', '#/components/schemas/AdminResponse'),
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
    },

    '/api/superadmin/admins/{id}': {
      get: {
        tags: ['superAdmin'],
        summary: 'Get admin by ID (superAdmin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Admin retrieved',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Admin retrieved', '#/components/schemas/AdminResponse'),
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['superAdmin'],
        summary: 'Delete an admin (superAdmin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Admin deleted',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Admin deleted', null),
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

    '/api/superadmin/admins/{id}/activate': {
      patch: {
        tags: ['superAdmin'],
        summary: 'Activate an admin (superAdmin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Admin activated',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Admin activated', '#/components/schemas/AdminResponse'),
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

    '/api/superadmin/admins/{id}/deactivate': {
      patch: {
        tags: ['superAdmin'],
        summary: 'Deactivate an admin (superAdmin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Admin deactivated',
            content: {
              'application/json': {
                schema: successEnvelope(200, 'Admin deactivated', '#/components/schemas/AdminResponse'),
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
  },
};