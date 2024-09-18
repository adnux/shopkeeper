SELECT COUNT(d.id) AS listing_count,
       AVG(d.revenue) AS avg_revenue,
       TO_CHAR(d.listing_date, 'YYYY') AS year,
       TO_CHAR(d.listing_date, 'MM') AS month,
       TO_CHAR(d.listing_date, 'YYYY-MM') AS listings_year_month,
       s.id AS broker_id,
       s.title AS broker,
       s.url AS broker_url,
       s.slug AS broker_slug
  FROM DEALS d
  LEFT JOIN sites s
    ON d.site_id = s.id
 WHERE 1=1
{{AND_CLAUSE}}
 GROUP BY listings_year_month, year, month, broker_id, broker, broker_url, broker
 ORDER BY listings_year_month, year, month, broker_id, broker, broker_url, broker
;