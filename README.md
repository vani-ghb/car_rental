# 🚗 Car Rental MERN Stack Application

A full-featured car rental application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

### Frontend
- 🎨 Modern, responsive UI with React
- 🔐 User authentication (Login/Register)
- 🚗 Car browsing and filtering
- 📅 Booking system with date selection
- 💳 Payment integration (Stripe/PayPal ready)
- 👤 User profile management
- 📱 Mobile-responsive design
- ⚡ Loading states and error handling

### Backend
- 🔐 JWT-based authentication
- 📊 RESTful API endpoints
- 🗄️ MongoDB database with Mongoose
- 📧 Email notifications
- 📁 File upload for car images
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Input validation and error handling
- 📝 Comprehensive logging

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern layouts
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **nodemailer** - Email service

### DevOps & Tools
- **Nodemon** - Development auto-restart
- **Morgan** - HTTP request logger
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

## 📁 Project Structure

```
car-rental/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── upload.js            # File upload middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Car.js               # Car model
│   │   └── Booking.js           # Booking model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── cars.js              # Car management routes
│   │   ├── bookings.js          # Booking routes
│   │   ├── users.js             # User management routes
│   │   └── payments.js          # Payment routes
│   ├── services/
│   │   └── emailService.js      # Email notification service
│   ├── test-api.js              # API testing script
│   ├── server.js                # Main server file
│   └── package.json             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx/css  # Loading component
│   │   │   ├── Navbar.jsx/css          # Navigation
│   │   │   ├── CarCard.jsx/css         # Car display card
│   │   │   ├── Login.jsx/css           # Login form
│   │   │   ├── Register.jsx/css        # Registration form
│   │   │   ├── About.jsx/css           # About page
│   │   │   ├── Testimonials.jsx/css    # Customer reviews
│   │   │   └── Footer.jsx/css          # Footer component
│   │   ├── data/
│   │   │   └── cars.js                 # Sample car data
│   │   ├── App.jsx/css                 # Main app component
│   │   └── main.jsx                    # App entry point
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies
│   └── vite.config.js                  # Vite configuration
└── README.md                           # This file
```

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd car-rental
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🔧 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/car-rental

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### Production Mode

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Car Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cars` | Get all cars with filtering | No |
| GET | `/api/cars/:id` | Get single car | No |
| POST | `/api/cars` | Create new car | Yes |
| PUT | `/api/cars/:id` | Update car | Yes (Owner/Admin) |
| DELETE | `/api/cars/:id` | Delete car | Yes (Owner/Admin) |
| GET | `/api/cars/search/:query` | Search cars | No |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings` | Get user bookings | Yes |
| GET | `/api/bookings/:id` | Get single booking | Yes (Owner) |
| POST | `/api/bookings` | Create booking | Yes |
| PUT | `/api/bookings/:id` | Update booking status | Yes (Owner/Admin) |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes (Owner) |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| GET | `/api/users/bookings` | Get user bookings | Yes |
| GET | `/api/users/cars` | Get user's cars | Yes |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-session` | Create payment session | Yes |
| POST | `/api/payments/webhook` | Payment webhook | No |
| GET | `/api/payments/history` | Payment history | Yes |
| POST | `/api/payments/refund` | Process refund | Yes (Admin) |
| GET | `/api/payments/methods` | Available payment methods | No |

## 🧪 Testing

### API Testing

Run the automated API test script:

```bash
cd backend
node test-api.js
```

This will test:
- Health check endpoint
- User registration and login
- Car CRUD operations
- Booking creation
- Payment methods

### Manual Testing

You can also test endpoints manually using tools like:
- **Postman** - API testing tool
- **curl** - Command line HTTP client
- **Thunder Client** - VS Code extension

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Use MongoDB Atlas for production
3. **Process Manager**: Use PM2 for production
   ```bash
   npm install -g pm2
   pm2 start server.js --name "car-rental-backend"
   ```

### Frontend Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Deploy to Hosting Service**:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Firebase Hosting

### Full Stack Deployment

For full-stack deployment, consider:
- **Heroku** (easy setup)
- **DigitalOcean App Platform**
- **AWS** (EC2 + S3 + CloudFront)
- **Vercel** + **Railway** (frontend + backend)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@carrental.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [API Docs](./docs/api.md)

---

**Happy Coding! 🚗💨**
