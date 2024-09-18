const express = require('express');
const path = require('path');
const handlebars = require('handlebars');
const { create } = require('express-handlebars');

// Configuration and Repositories
const pool = require('./config/database');
const DealRepository = require('./infrastructure/repositories/DealRepository');

// Services
const DealService = require('./application/services/DealService');

// Interfaces
const createRoutes = require('./interfaces/routes/routes');

const app = express();

// Create an instance of Handlebars
const hbs = create({
  helpers: {
    json: (context) => JSON.stringify(context),
    link: (text, url) => {
      const escapedUrl = handlebars.escapeExpression(url);
      const escapedText = handlebars.escapeExpression(text);
      return new handlebars.SafeString(`<a href='${escapedUrl}'>${escapedText}</a>`);
    },
    money: (value) => {
      const number = parseFloat(value);
      return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
    format_date: (date) => {
      return date?.toISOString()?.slice(0, 7);
    },
  },
  extname: '.hbs',
  defaultLayout: false,
});
// Set up Handlebars as the template engine
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Static files middleware (if needed)
app.use(express.static(path.join(__dirname, '../public')));

// Instantiate Repositories
const dealRepository = new DealRepository(pool);

// Instantiate Services
const dealService = new DealService(dealRepository);

// Set up Routes
const routes = createRoutes({ dealService });
app.use('/', routes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));