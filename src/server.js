const express = require('express');
const handlebars = require('handlebars');
const { create } = require('express-handlebars');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
// Get environment variables
const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

// Set up database connection
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: { rejectUnauthorized: false },
});
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
      return date.toISOString().slice(0, 7);
    },
  },
  extname: '.hbs',
  defaultLayout: false,
});
// Set up Handlebars as the template engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../views'));

// Static files middleware (for Chart.js)
app.use(express.static(path.join(__dirname, 'public')));

const buildGraphWhereClause = (queryParams) => {
  const { listing_year, listing_month, broker } = queryParams;

  let newAndClause = ``;
  if (!listing_year && !listing_month && !broker ) {
    newAndClause = `   AND d.listing_date BETWEEN '2020-11-01' AND '2021-11-30'`;
  } else {
    if (listing_year) {
      newAndClause += `   AND EXTRACT(YEAR FROM d.listing_date) = ${listing_year}\n`;
    }
    if (listing_month) {
      newAndClause += `   AND EXTRACT(MONTH FROM d.listing_date) = ${listing_month}\n`;
    }
    if (broker) {
      newAndClause += `   AND s.title like '${broker}'\n`;
    }
  }
  
  return newAndClause;
};

const buildTableWhereClause = (queryParams) => {
  const { listing_id, listing_year, listing_month, listing_date, broker, revenue } = queryParams;

  let newAndClause = ``;
  if (!listing_id && !listing_year && !listing_month && !listing_date && !broker && !revenue) {
    newAndClause = `   AND d.listing_date BETWEEN '2020-11-01' AND '2021-11-30'`;
  } else {
    if (listing_id) {
      newAndClause += `   AND d.id = ${listing_id}\n`;
    }
    if (listing_year) {
      newAndClause += `   AND EXTRACT(YEAR FROM d.listing_date) = ${listing_year}\n`;
    }
    if (listing_month) {
      newAndClause += `   AND EXTRACT(MONTH FROM d.listing_date) = ${listing_month}\n`;
    }
    if (listing_date) {
      newAndClause += `   AND d.listing_date = '${listing_date}'\n`;
    }
    if (broker) {
      newAndClause += `   AND s.title like '${broker}'\n`;
    }
    if (revenue) {
      const decodedRevenue = decodeURIComponent(revenue);
      const revenueNumber = parseFloat(decodedRevenue.replace(/[^0-9.-]+/g, ''));
      newAndClause += `   AND d.revenue = ${revenueNumber}`;
    }
  }

  return newAndClause;
};

const buildTableSortClause = (queryParams) => {
  const { sort } = queryParams;

  let sortClause = 'ORDER BY d.listing_date, s.title';
  let sorterMap = {
    listing_id: 'd.id',
    listing_date: 'd.listing_date',
    broker: 's.title',
    revenue: 'd.revenue',
  };
  if (sort) {
    sortClause = `   ORDER BY ${sorterMap[sort]}`;
  }
  return sortClause;
};

const createTableListingSQL = (sqlString, queryParams) => {
  if(process.env.LOG === 'true') {
    console.log('queryParams =====> ', queryParams);
  }

  let newSQL = '';

  newSQL = sqlString
    .replace('{{AND_CLAUSE}}', buildTableWhereClause(queryParams))
    .replace('{{SORT_CLAUSE}}', buildTableSortClause(queryParams));

    if(process.env.LOG === 'true') {
      console.log('createTableListingSQL newSQL =====> ', newSQL);
    }

  return newSQL;
};

const createGraphListingSQL = (sqlString, queryParams) => {

  let newSQL = '';

  newSQL = sqlString.replace('{{AND_CLAUSE}}', buildGraphWhereClause(queryParams));

  if(process.env.LOG === 'true') {
    console.log('createGraphListingSQL newSQL =====> ', newSQL);
  }

  return newSQL;
};

// Route to render the data
app.get('/', async (req, res) => {
  try {
    // Query for the line graph data
    const listingsPerMonthAvgRevenue = fs.readFileSync('src/sql/listings_per_month_avg_revenue.sql').toString();
    const graphSql = createGraphListingSQL(listingsPerMonthAvgRevenue, req.query);
    const graphDataResult = await pool.query(graphSql);

    if(process.env.LOG === 'true') {
      console.log('graphDataResult =====> ', graphDataResult?.rows?.slice(0, 3));
    }

    // Query for the data table
    const listingsPerMonth = fs.readFileSync('src/sql/listings_per_month.sql').toString();
    const listingsSql = createTableListingSQL(listingsPerMonth, req.query);
    const tableDataResult = await pool.query(listingsSql);

    if(process.env.LOG === 'true') {
      console.log('tableDataResult =====> ', tableDataResult?.rows?.slice(0, 1));
    }

    res.render(
      'index',
      {
        graphDataJson: JSON.stringify(graphDataResult.rows),
        graphData: graphDataResult.rows,
        tableData: tableDataResult.rows,
        queryParams: JSON.stringify(req.query),
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
