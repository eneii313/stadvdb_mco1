const express = require('express');
const router = express.Router();


// SETUP MYSQL CONNECTION
const mysql = require('mysql2');

// CONFIG: change values to your local db connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "h01",
  multipleStatements: true,
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

// ------------------------------------------------ QUERIES ------------------------------------------------
router.get('/get-options', (req, res) => {

    const query = 'SELECT DISTINCT tag_name FROM supplies_order_item_tags;';

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }

      res.json(results);

    });
});

router.get('/get-columns', (req, res) => {
  const query = `SELECT COLUMN_NAME
                  FROM INFORMATION_SCHEMA.COLUMNS
                  WHERE TABLE_NAME = 'supplies_orders'
                  ORDER BY ORDINAL_POSITION;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query for attributes failed' });
    }

      res.json({ columns: results});

  });
});


router.get('/get-rows', (req, res) => {

  let page = parseInt(req.query.page) || 1;  // current page
  let limit = parseInt(req.query.limit) || 10;  // rows per page
  let offset = (page - 1) * limit;  // offset for SQL query
        
  const query = 'SELECT * FROM supplies_orders LIMIT ? OFFSET ?;';

  // used this to test page limit
  // const query = 'SELECT * FROM h01.supplies_orders WHERE YEAR(saleDate) = 2015 AND MONTH(saleDate) = 10 LIMIT ? OFFSET ?';

  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query for rows failed' });
    }

    res.json({ rows: results, page: page, limit: limit });
  });
});

module.exports = router;
