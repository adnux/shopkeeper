const express = require('express');
const router = express.Router();

module.exports = function({ dealService }) {
  router.get('/', async (req, res) => {
    try {

      const deals = await dealService.getDealData(req.query);
      const aggregatedData = await dealService.getAggregatedDealData(req.query);

    if(process.env.LOG === 'true') {
      console.log('aggregatedData =====> ', aggregatedData.splice(0, 3));
    }

      res.render('index', {
        graphDataJson: JSON.stringify(aggregatedData),
        graphData: aggregatedData,
        tableData: deals,
        queryParams: JSON.stringify(req.query),
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching data');
    }
  });

  return router;
};