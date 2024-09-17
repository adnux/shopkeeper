SELECT --EXTRACT(YEAR FROM d.listing_date)AS year,
      --  EXTRACT(MONTH FROM d.listing_date) AS month,
       TO_CHAR(d.listing_date, 'YYYY') AS year,
       TO_CHAR(d.listing_date, 'MM') AS month,
       COUNT(d.id) AS listing_count,
       AVG(d.revenue) AS avg_revenue,
       s.title AS broker
  FROM DEALS d
  LEFT JOIN sites s
    ON d.site_id = s.id
 WHERE 1=1
{{AND_CLAUSE}}
 GROUP BY year, month, broker
 ORDER BY year, month, broker
;