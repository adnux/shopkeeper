class DealService {
  constructor(dealRepository) {
    this.dealRepository = dealRepository;
  }

  async getDealData(queryParams) {
    const deals = await this.dealRepository.getDealsForPeriod(queryParams);
    return deals;
  }

  async getAggregatedDealData(queryParams) {
    const aggregatedData = await this.dealRepository.getAggregatedData(queryParams);
    return aggregatedData;
  }
}

module.exports = DealService;