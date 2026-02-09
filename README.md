<<<<<<< HEAD
# WEBFINAL
=======
# Assignment 3: MongoDB CRUD API with Authentication & MVC Architecture

A full-stack web application with a MongoDB-based CRUD API featuring professional security measures, Role-Based Access Control (RBAC), and a scalable MVC (Model-View-Controller) architecture. This project demonstrates data persistence, complex object schemas, relationship management, authentication, and authorization.

## 🌟 Features

### Core Requirements
- **Product Management**: Full CRUD operations for products
  - Create, Read, Update, and Delete products
  - Product schema with name, price, description, category
  - Automatic timestamps (createdAt, updatedAt)
  
- **Review Management**: Secondary CRUD operations for product reviews
  - Create, Read, Update, and Delete reviews
  - Review schema with product reference, reviewer name, rating, and comment
  - Relationship management between products and reviews

### Security & Authentication
- **User Authentication**: JWT-based authentication system
- **Password Security**: Bcrypt password hashing (never store plain-text passwords)
- **Role-Based Access Control (RBAC)**:
  - **Public Access**: GET routes (read operations) are open to everyone
  - **Protected Access**: POST, PUT, DELETE routes require authentication
  - **Admin Access**: Only users with "admin" role can create, update, or delete resources
- **User Roles**: "user" (default) and "admin"

### Architecture
- **MVC Pattern**: Clean separation of concerns
  - **Models**: MongoDB/Mongoose schemas
  - **Views**: Frontend HTML/CSS/JavaScript
  - **Controllers**: Business logic and request handling
- **Modular Structure**: Organized into routes, controllers, middleware, and models
- **Error Handling**: Centralized error handling middleware

### User Interface
- **Modern Design**: Clean, responsive interface with dark theme
- **Product List View**: Grid layout displaying all products
- **Add Product Form**: Simple form to create new products (requires admin authentication)
- **Real-time Updates**: Automatic refresh after creating/deleting products
- **Error Handling**: User-friendly error messages

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher) installed on your system
- **npm** (Node Package Manager) installed
- **MongoDB** installed locally OR a MongoDB Atlas account (cloud)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

#### Option A: MongoDB Atlas (Cloud - Recommended)

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productsdb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Option B: Local MongoDB

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/productsdb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🏗️ Project Structure (MVC Architecture)

```
web2assign2-main/
│
├── server.js                 # Main server file (entry point)
├── package.json              # Project dependencies and scripts
├── .env                      # Environment variables (create this file)
├── README.md                 # This file
│
├── config/                   # Configuration files
│   └── database.js          # MongoDB connection configuration
│
├── models/                   # Mongoose schemas (Data Layer)
│   ├── Product.js           # Product model schema
│   ├── Review.js            # Review model schema
│   └── User.js              # User model schema (with password hashing)
│
├── controllers/              # Business logic (Controller Layer)
│   ├── productController.js # Product CRUD operations
│   ├── reviewController.js  # Review CRUD operations
│   └── authController.js    # Authentication operations
│
├── routes/                   # API route definitions
│   ├── products.js          # Product routes with auth middleware
│   ├── reviews.js           # Review routes with auth middleware
│   └── auth.js              # Authentication routes
│
├── middleware/               # Middleware functions
│   ├── auth.js              # JWT authentication & RBAC middleware
│   ├── validation.js        # Input validation middleware
│   └── errorHandler.js      # Centralized error handling
│
└── public/                   # Frontend static files (View Layer)
    ├── index.html           # Main HTML file
    ├── css/
    │   └── style.css        # Stylesheet with responsive design
    └── js/
        └── app.js           # Frontend JavaScript logic
```

## 📊 Database Schema

### User Schema
- `email` (String, required, unique): User email address
- `password` (String, required, hashed): User password (hashed with bcrypt)
- `role` (String, enum: ['user', 'admin'], default: 'user'): User role
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

### Product Schema
- `name` (String, required): Product name
- `price` (Number, required): Product price (must be >= 0)
- `description` (String, required): Product description
- `category` (String, required): Product category
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

### Review Schema
- `productId` (ObjectId, required, ref: Product): Reference to product
- `reviewerName` (String, required): Name of reviewer
- `rating` (Number, required): Rating between 1-5
- `comment` (String, required): Review comment
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

## 📡 API Endpoints

### Authentication API

#### Register a New User
**POST** `/api/auth/register`

**Access**: Public

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

Response (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
**POST** `/api/auth/login`

**Access**: Public

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User Profile
**GET** `/api/auth/profile`

**Access**: Protected (requires authentication)

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Products API

#### Create a Product
**POST** `/api/products`

**Access**: Admin only (requires authentication + admin role)

Headers:
```
Authorization: Bearer <admin_token>
```

Request Body:
```json
{
  "name": "Laptop",
  "price": 999.99,
  "description": "High-performance laptop for work and gaming",
  "category": "Electronics"
}
```

Response (201 Created):
```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "name": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop for work and gaming",
    "category": "Electronics",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get All Products
**GET** `/api/products`

**Access**: Public (no authentication required)

Response (200 OK):
```json
{
  "count": 2,
  "products": [
    {
      "_id": "...",
      "name": "Laptop",
      "price": 999.99,
      "description": "High-performance laptop",
      "category": "Electronics",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Product by ID
**GET** `/api/products/:id`

**Access**: Public (no authentication required)

#### Update Product
**PUT** `/api/products/:id`

**Access**: Admin only (requires authentication + admin role)

Headers:
```
Authorization: Bearer <admin_token>
```

#### Delete Product
**DELETE** `/api/products/:id`

**Access**: Admin only (requires authentication + admin role)

Headers:
```
Authorization: Bearer <admin_token>
```

### Reviews API

#### Create a Review
**POST** `/api/reviews`

**Access**: Admin only (requires authentication + admin role)

#### Get All Reviews
**GET** `/api/reviews`

**Access**: Public (no authentication required)

#### Get Review by ID
**GET** `/api/reviews/:id`

**Access**: Public (no authentication required)

#### Update Review
**PUT** `/api/reviews/:id`

**Access**: Admin only (requires authentication + admin role)

#### Delete Review
**DELETE** `/api/reviews/:id`

**Access**: Admin only (requires authentication + admin role)

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Register/Login**: User registers or logs in and receives a JWT token
2. **Token Usage**: Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. **Token Expiration**: Tokens expire after 7 days (configurable)

### Access Control

| Operation | Route Type | Access Level |
|-----------|-----------|--------------|
| GET (Read) | Products, Reviews | Public (No auth required) |
| POST (Create) | Products, Reviews | Admin only |
| PUT (Update) | Products, Reviews | Admin only |
| DELETE | Products, Reviews | Admin only |

### Creating an Admin User

To create an admin user, register with `role: "admin"`:

```bash
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

## 🧪 Testing the API

### Using Postman

1. **Register a User**:
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "role": "admin"
     }
     ```
   - Copy the `token` from the response

2. **Create a Product** (Admin only):
   - Method: POST
   - URL: `http://localhost:3000/api/products`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer <your-token>`
   - Body (JSON):
     ```json
     {
       "name": "Test Product",
       "price": 29.99,
       "description": "This is a test product",
       "category": "Test Category"
     }
     ```

3. **Get All Products** (Public):
   - Method: GET
   - URL: `http://localhost:3000/api/products`
   - No authentication required

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com",
  "password":"password123",
  "role":"admin"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com",
  "password":"password123"}'

# Create a product (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Product","price":29.99,"description":"Test","category":"Test"}'

# Get all products (no auth required)
curl http://localhost:3000/api/products
```

## 🔧 Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors or invalid input
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions (not admin)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

Error Response Format:
```json
{
  "error": "Error message",
  "details": ["Detail 1", "Detail 2"]
}
```

## 🔧 Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`
- Check MongoDB connection string in `.env` file
- Verify JWT_SECRET is set in `.env` file

### Authentication errors
- Verify token is included in `Authorization` header
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (7 days default)
- Verify JWT_SECRET matches between token creation and verification

### Authorization errors (403 Forbidden)
- Ensure user has "admin" role for POST, PUT, DELETE operations
- Verify token belongs to an admin user
- Check user role in database

### MongoDB connection errors
- Verify MongoDB is running (if using local instance)
- Check MongoDB Atlas connection string (if using cloud)
- Ensure network access is configured in MongoDB Atlas
- Verify database user credentials

### Validation errors
- Ensure all required fields are provided
- Check data types match schema requirements
- Verify email format for user registration/login
- Ensure password is at least 6 characters

## 📝 Security Best Practices

1. **JWT Secret**: Always use a strong, random JWT_SECRET in production
2. **Password Hashing**: Passwords are automatically hashed using bcrypt (never stored in plain text)
3. **Token Expiration**: Tokens expire after 7 days (configurable)
4. **Environment Variables**: Never commit `.env` file to version control
5. **HTTPS**: Use HTTPS in production to protect tokens in transit
6. **Input Validation**: All inputs are validated before processing

## 🎯 MVC Architecture Benefits

- **Separation of Concerns**: Clear division between data (models), logic (controllers), and presentation (views)
- **Maintainability**: Easy to locate and modify specific functionality
- **Scalability**: Can easily add new features without affecting existing code
- **Testability**: Controllers and models can be tested independently
- **Reusability**: Middleware and controllers can be reused across routes

---

Created as part of Assignment 3: MongoDB CRUD API with Authentication & MVC Architecture
>>>>>>> d442939 (Initial commit)
