const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
dotenv.config({ path: './config.env' })

console.log(process.env.NODE_ENV)
// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTE HANDLERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;