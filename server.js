const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import routes
const companies = require('./routes/companies');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const interviewsession = require('./routes/InterviewSession');

// Connect to the database
connectDB();

const app = express();

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'VacQ API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis: ['./routes/*.js'],  // Path to the API route files for documentation
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());  // Sanitize data
app.use(helmet());  // Set security headers
app.use(xss());  // Prevent XSS attacks

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'https://projectsop-frontend.vercel.app/',  // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // Allow cookies or headers
}));

// Rate limiting (100 requests per 10 minutes)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutes
    max: 100
});
app.use(limiter);

// Routes
app.use('/api/v1/companies', companies);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/sessions', interviewsession);

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
