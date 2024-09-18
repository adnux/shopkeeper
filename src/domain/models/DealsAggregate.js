class DealsAggregate {
  constructor({
    listing_count,
    avg_revenue,
    year,
    month,
    listings_year_month,
    broker_id,
    broker_name,
    broker_url,
    broker_slug,
  }) {
    this.listing_count = listing_count;
    this.avg_revenue = avg_revenue;
    this.year = year;
    this.month = month;
    this.listings_year_month = listings_year_month;
    this.broker_id = broker_id;
    this.broker_name = broker_name;
    this.broker_url = broker_url;
    this.broker_slug = broker_slug;
  }

  getListingCount() {
    return this.listing_count;
  }
  getAvgRevenue() {
    return this.avg_revenue;
  }
  getYear() {
    return this.year;
  }
  getMonth() {
    return this.month;
  }
  getListingsYearMonth() {
    return this.listings_year_month;
  }
  getBrokerId() {
    return this.broker_id;
  }
  getBrokerName() {
    return this.broker_name;
  }
  getBrokerUrl() {
    return this.broker_url;
  }
  getBrokerSlug() {
    return this.broker_slug;
  }

  toJSON() {
    return JSON.parse({
      listing_count: this.listing_count,
      avg_revenue: this.avg_revenue,
      year: this.year,
      month: this.month,
      listings_year_month: this.listings_year_month,
      broker_id: this.broker_id,
      broker_name: this.broker,
      broker_url: this.broker_url,
      broker_slug: this.broker_slug,
    });
  }
}

module.exports = DealsAggregate;