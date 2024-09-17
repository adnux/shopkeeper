SELECT d.id AS listing_id,
       TO_CHAR(d.listing_date, 'YYYY') AS listing_year,
       TO_CHAR(d.listing_date, 'MM') AS listing_month,
      --  TO_CHAR(d.listing_date, 'YYYY-MM-DD') AS listing_date,
       d.listing_date AS listing_date,
       d.revenue,
       s.title AS broker,
       s.url AS broker_url,
       s.slug AS broker_slug
  FROM deals d
  LEFT JOIN sites s ON d.site_id = s.id
 WHERE 1=1
{{AND_CLAUSE}}
{{SORT_CLAUSE}}
;