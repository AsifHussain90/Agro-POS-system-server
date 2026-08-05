/**
 * swagger.js
 *
 * OpenAPI 3.0 document for the Agro Marketplace backend.
 * This file documents all implemented routes and response shapes.
 */

const successEnvelope = (statusCode, message, dataRef) => ({
  allOf: [
    { $ref: "#/components/schemas/ApiSuccess" },
    {
      type: "object",
      properties: {
        statusCode: { type: "integer", example: statusCode },
        message: { type: "string", example: message },
        data: dataRef
          ? { $ref: dataRef }
          : { type: "object", nullable: true, example: null },
      },
    },
  ],
});

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Agro Marketplace API",
    version: "1.0.0",
    description:
      "Backend API for auth, farmer applications, products, orders, and uploads.",
    contact: { name: "Developer Support", email: "support@example.com" },
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development server" },
  ],
  tags: [
    { name: "Health", description: "Server and app health endpoints." },
    { name: "Auth", description: "Authentication and session management." },
    { name: "Upload", description: "Profile image upload operations." },
    {
      name: "Farmers",
      description: "Farmer application and profile management.",
    },
    { name: "Products", description: "Farmer product catalog endpoints." },
    { name: "Orders", description: "Buyer and farmer order operations." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      accessCookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" },
      refreshCookieAuth: { type: "apiKey", in: "cookie", name: "refreshToken" },
    },
    schemas: {
      UserAvatar: {
        type: "object",
        nullable: true,
        properties: {
          url: {
            type: "string",
            format: "uri",
            example:
              "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg",
          },
          publicId: { type: "string", example: "avatars/user_abc123" },
        },
      },
      SafeUser: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
          fullName: { type: "string", example: "Jane Doe" },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          role: {
            type: "string",
            enum: ["user", "farmer", "admin"],
            example: "user",
          },
          avatar: { $ref: "#/components/schemas/UserAvatar" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-08-05T12:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-08-05T12:00:00.000Z",
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "Jane Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          password: { type: "string", minLength: 8, example: "Str0ng!Pass" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          password: { type: "string", example: "Str0ng!Pass" },
        },
      },
      FarmerAddress: {
        type: "object",
        required: ["city", "state"],
        properties: {
          street: { type: "string", nullable: true, example: "123 Farm Rd" },
          city: { type: "string", example: "Lahore" },
          state: { type: "string", example: "Punjab" },
          country: { type: "string", example: "Pakistan" },
          zipCode: { type: "string", nullable: true, example: "54000" },
        },
      },
      FarmerLocation: {
        type: "object",
        required: ["type", "address"],
        properties: {
          type: { type: "string", enum: ["Point"], example: "Point" },
          address: { $ref: "#/components/schemas/FarmerAddress" },
        },
      },
      FarmerCrop: {
        type: "object",
        required: ["name", "category", "season"],
        properties: {
          name: { type: "string", example: "Tomatoes" },
          category: {
            type: "string",
            enum: ["vegetable", "fruit", "grain", "pulse", "other"],
            example: "vegetable",
          },
          season: {
            type: "string",
            enum: ["kharif", "rabi", "zaid", "year-round"],
            example: "kharif",
          },
          isOrganic: { type: "boolean", example: true },
        },
      },
      FarmerCertification: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Organic Certified" },
          issuedBy: {
            type: "string",
            nullable: true,
            example: "Organic Board",
          },
          issuedDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2025-08-01T00:00:00.000Z",
          },
          expiryDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-08-01T00:00:00.000Z",
          },
          certificateNumber: {
            type: "string",
            nullable: true,
            example: "CERT-1234",
          },
          documentUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://example.com/certificate.pdf",
          },
        },
      },
      FarmerImage: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            example: "https://example.com/farm.jpg",
          },
          caption: {
            type: "string",
            nullable: true,
            example: "Farm front view",
          },
        },
      },
      FarmerApplicationRequest: {
        type: "object",
        required: ["farmName", "location", "farmSize"],
        properties: {
          farmName: {
            type: "string",
            minLength: 3,
            maxLength: 100,
            example: "Green Valley Farm",
          },
          farmDescription: {
            type: "string",
            maxLength: 1000,
            nullable: true,
            example: "Organic vegetables and fruits.",
          },
          location: { $ref: "#/components/schemas/FarmerLocation" },
          farmSize: {
            type: "object",
            required: ["value", "unit"],
            properties: {
              value: { type: "number", minimum: 0, example: 12.5 },
              unit: {
                type: "string",
                enum: ["acres", "hectares", "sqft"],
                example: "acres",
              },
            },
          },
          crops: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCrop" },
            example: [
              {
                name: "Tomatoes",
                category: "vegetable",
                season: "kharif",
                isOrganic: true,
              },
            ],
          },
          certifications: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCertification" },
          },
          farmImages: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerImage" },
          },
        },
      },
      FarmerUpdateRequest: {
        type: "object",
        properties: {
          farmName: { type: "string", minLength: 3, maxLength: 100 },
          farmDescription: { type: "string", maxLength: 1000, nullable: true },
          location: { $ref: "#/components/schemas/FarmerLocation" },
          farmSize: {
            type: "object",
            properties: {
              value: { type: "number", minimum: 0 },
              unit: { type: "string", enum: ["acres", "hectares", "sqft"] },
            },
          },
          crops: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCrop" },
          },
          certifications: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCertification" },
          },
          farmImages: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerImage" },
          },
        },
      },
      FarmerProfile: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { $ref: "#/components/schemas/SafeUser" },
          farmName: { type: "string" },
          farmDescription: { type: "string", nullable: true },
          location: { $ref: "#/components/schemas/FarmerLocation" },
          farmSize: {
            type: "object",
            properties: {
              value: { type: "number" },
              unit: { type: "string" },
            },
          },
          crops: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCrop" },
          },
          certifications: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerCertification" },
          },
          farmImages: {
            type: "array",
            items: { $ref: "#/components/schemas/FarmerImage" },
          },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          approvalDate: { type: "string", format: "date-time", nullable: true },
          rejectionReason: { type: "string", nullable: true },
          isVerified: { type: "boolean" },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductRequest: {
        type: "object",
        required: ["name", "price", "quantity", "category"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 150 },
          description: { type: "string", maxLength: 2000, nullable: true },
          price: { type: "number", minimum: 0 },
          quantity: { type: "integer", minimum: 0 },
          category: { type: "string", maxLength: 100 },
          images: {
            type: "array",
            items: { type: "string", format: "uri" },
            nullable: true,
          },
        },
      },
      UpdateProductRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 3, maxLength: 150 },
          description: { type: "string", maxLength: 2000, nullable: true },
          price: { type: "number", minimum: 0 },
          quantity: { type: "integer", minimum: 0 },
          category: { type: "string", maxLength: 100 },
          images: {
            type: "array",
            items: { type: "string", format: "uri" },
            nullable: true,
          },
        },
      },
      ProductResponse: {
        type: "object",
        properties: {
          _id: { type: "string" },
          farmer: {
            type: "object",
            properties: {
              _id: { type: "string" },
              fullName: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          price: { type: "number" },
          quantity: { type: "integer" },
          category: { type: "string" },
          images: { type: "array", items: { type: "string", format: "uri" } },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderItemRequest: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
        },
      },
      OrderCreateRequest: {
        type: "object",
        required: ["products"],
        properties: {
          products: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/OrderItemRequest" },
          },
        },
      },
      OrderProductItem: {
        type: "object",
        properties: {
          product: { type: "string" },
          quantity: { type: "integer" },
          price: { type: "number" },
        },
      },
      OrderResponse: {
        type: "object",
        properties: {
          _id: { type: "string" },
          buyer: { type: "string" },
          farmer: { type: "string" },
          products: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderProductItem" },
          },
          totalAmount: { type: "number" },
          status: {
            type: "string",
            enum: ["pending", "completed", "cancelled"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProfileImageData: {
        type: "object",
        properties: {
          imageUrl: { type: "string", format: "uri" },
          user: { $ref: "#/components/schemas/SafeUser" },
        },
      },
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object", nullable: true },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Something went wrong" },
        },
      },
      ValidationErrorDetail: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "array", items: { type: "string" } },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: "Validation failed.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationErrorDetail" },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      NotFound: {
        description: "Not found.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Conflict: {
        description: "Conflict.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      TooManyRequests: {
        description: "Too many requests.",
        headers: {
          "Retry-After": {
            description: "Seconds until retry",
            schema: { type: "integer" },
          },
        },
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                  },
                  example: { success: true, message: "ok" },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "User created",
                  "#/components/schemas/AuthSuccessData",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          409: { $ref: "#/components/responses/Conflict" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Signup alias for register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "User created",
                  "#/components/schemas/AuthSuccessData",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          409: { $ref: "#/components/responses/Conflict" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Login successful",
                  "#/components/schemas/AuthSuccessData",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get current profile",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Profile fetched successfully",
                  "#/components/schemas/AuthSuccessData",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Logged out successfully", null),
              },
            },
          },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: [{ refreshCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Token refreshed",
                  "#/components/schemas/AuthSuccessData",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/upload/profile-image": {
      post: {
        tags: ["Upload"],
        summary: "Upload profile image",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: { avatar: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "Profile image uploaded successfully.",
                  "#/components/schemas/ProfileImageData",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
      put: {
        tags: ["Upload"],
        summary: "Replace profile image",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: { avatar: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Profile image updated successfully.",
                  "#/components/schemas/ProfileImageData",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        tags: ["Upload"],
        summary: "Delete profile image",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Profile image deleted successfully.",
                  null,
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/apply": {
      post: {
        tags: ["Farmers"],
        summary: "Apply as a farmer",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FarmerApplicationRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "Farmer application submitted",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/me": {
      get: {
        tags: ["Farmers"],
        summary: "Get the authenticated farmer profile",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Farmer profile retrieved",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/profile": {
      put: {
        tags: ["Farmers"],
        summary: "Update farmer profile",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FarmerUpdateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Farmer profile updated",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/admin/farmer-requests": {
      get: {
        tags: ["Farmers"],
        summary: "List farmer applications",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Farmer requests retrieved", {
                  type: "array",
                  items: { $ref: "#/components/schemas/FarmerProfile" },
                }),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/admin/farmer-requests/{id}": {
      get: {
        tags: ["Farmers"],
        summary: "Get farmer request by id",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Farmer request retrieved",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/admin/farmer-requests/{id}/approve": {
      patch: {
        tags: ["Farmers"],
        summary: "Approve farmer request",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Farmer request approved",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/farmers/admin/farmer-requests/{id}/reject": {
      patch: {
        tags: ["Farmers"],
        summary: "Reject farmer request",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  rejectionReason: {
                    type: "string",
                    example: "Missing required documents.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Farmer request rejected",
                  "#/components/schemas/FarmerProfile",
                ),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List all active products",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Products retrieved", {
                  type: "array",
                  items: { $ref: "#/components/schemas/ProductResponse" },
                }),
              },
            },
          },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "Product created",
                  "#/components/schemas/ProductResponse",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by its id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Product retrieved",
                  "#/components/schemas/ProductResponse",
                ),
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProductRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(
                  200,
                  "Product updated",
                  "#/components/schemas/ProductResponse",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Product deleted", null),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create an order",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderCreateRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: successEnvelope(
                  201,
                  "Order created",
                  "#/components/schemas/OrderResponse",
                ),
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/orders/my-orders": {
      get: {
        tags: ["Orders"],
        summary: "Get orders for the authenticated buyer",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Order history retrieved", {
                  type: "array",
                  items: { $ref: "#/components/schemas/OrderResponse" },
                }),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api/orders/farmer/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get orders for the authenticated farmer",
        security: [{ bearerAuth: [] }, { accessCookieAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: successEnvelope(200, "Farmer orders retrieved", {
                  type: "array",
                  items: { $ref: "#/components/schemas/OrderResponse" },
                }),
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
  },
};
