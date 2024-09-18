const fs = require('fs');
const Deal = require('../../domain/models/Deal');

class DealRepository {
  constructor(pool) {
    this.pool = pool;
  }

  buildTableWhereClause (queryParams) {
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
  
  buildTableSortClause (queryParams) {
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

  createTableListingSQL(sqlString, queryParams) {
    if (process.env.LOG === 'true') {
      console.log('queryParams =====> ', queryParams);
    }

    let newSQL = '';

    newSQL = sqlString
      .replace('{{AND_CLAUSE}}', this.buildTableWhereClause(queryParams))
      .replace('{{SORT_CLAUSE}}', this.buildTableSortClause(queryParams));

    if (process.env.LOG === 'true') {
      console.log('createTableListingSQL newSQL =====> ', newSQL);
    }

    return newSQL;
  }

  buildGraphWhereClause(queryParams) {
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

  createGraphListingSQL(sqlString, queryParams) {
  
    let newSQL = '';
  
    newSQL = sqlString.replace('{{AND_CLAUSE}}', this.buildGraphWhereClause(queryParams));
  
    if(process.env.LOG === 'true') {
      console.log('createGraphListingSQL newSQL =====> ', newSQL);
    }
  
    return newSQL;
  };

  async getDealsForPeriod(queryParams) {
    const listingsPerMonth = fs.readFileSync('src/sql/listings_per_month.sql').toString();
    const getDealsForPeriodSql = this.createTableListingSQL(listingsPerMonth, queryParams);
    const result = await this.pool.query(getDealsForPeriodSql);

    return result.rows;
  }

  async getAggregatedData(queryParams) {
    const listingsPerMonthAvgRevenue = fs.readFileSync('src/sql/listings_per_month_avg_revenue.sql').toString();
    const getAggregatedSql = this.createGraphListingSQL(listingsPerMonthAvgRevenue, queryParams);
    const result = await this.pool.query(getAggregatedSql);

    return result.rows;
  }
}

module.exports = DealRepository;
