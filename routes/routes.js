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

// QUERIES
router.get('/get-options', (req, res) => {

    const query = 'SELECT DISTINCT tag_name FROM supplies_order_item_tags;';

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }

      res.json(results);

    });
});


router.get('/get-orders', (req, res) => {

  const query1 = `SELECT COLUMN_NAME
                  FROM INFORMATION_SCHEMA.COLUMNS
                  WHERE TABLE_NAME = 'supplies_orders'
                  ORDER BY ORDINAL_POSITION;`;
  const query2 = 'SELECT * FROM supplies_orders LIMIT 10;';

  db.query(query1, (err, results1) => {
    if (err) {
      console.error('Error executing first query:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    db.query(query2, (err, results2) => {
      if (err) {
        console.error('Error executing second query:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      res.json({ columns: results1, rows: results2 });
    });

  });
});

module.exports = router;
