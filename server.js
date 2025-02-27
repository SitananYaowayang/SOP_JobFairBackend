const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');



//Load env vars
dotenv.config({path:'./config/config.env'});

const companies = require ("./routes/companies");
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const interviewsession = require('./routes/InterviewSession');

connectDB();

const app = express();

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5050/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.json());

app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max: 100
});
app.use(limiter);


app.use("/api/v1/companies" ,companies);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/sessions', interviewsession)

const PORT = process.env.PORT || 5000;
const Server =  app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'mode on port' , PORT));

process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    Server.close(() => process.exit(1));
});