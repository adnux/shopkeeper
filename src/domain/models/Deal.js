class Deal {
  constructor({
    listing_id,
    listing_year,
    listing_month,
    listing_date,
    revenue,
    broker,
    broker_url,
    broker_slug,
  }) {
    this.id = listing_id
    this.year = listing_year
    this.month = listing_month
    this.date = listing_date
    this.revenue = revenue
    this.broker_name = broker
    this.broker_url = broker_url
    this.broker_slug = broker_slug

  }
  getListingId() {
    return this.listing_id;
  }

  getListingYear() {
    return this.year;
  }

  getListingMonth() {
    return this.month;
  }

  getListingDate() {
    return this.date;
  }

  getRevenue() {
    return this.revenue;
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

  toJson() {
    return JSON.parse({
      listing_id: this.listing_id,
      listing_year: this.year,
      listing_month: this.month,
      listing_date: this.date,
      revenue: this.revenue,
      broker: this.broker_name,
      broker_url: this.broker_url,
      broker_slug: this.broker_slug,
    });
  }
}

module.exports = Deal;