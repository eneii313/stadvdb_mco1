const express = require('express');
const router = express.Router();


// SETUP MYSQL CONNECTION
const mysql = require('mysql2');

// CONFIG: change values to your local db connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mco1",
  multipleStatements: true,
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

// ------------------------------------------------ QUERIES ------------------------------------------------
router.get('/get-genres', (req, res) => {

    const query = `SELECT DISTINCT genre FROM game_genres
                    ORDER BY genre ASC;`;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }

      res.json(results);

    });
});

router.get('/get-years', (req, res) => {

  const query = `SELECT DISTINCT YEAR(release_date) AS release_year FROM games
                  WHERE release_date IS NOT NULL
                  ORDER BY release_year ASC;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);

  });
});

router.get('/get-languages', (req, res) => {

  const query = `SELECT DISTINCT fullaudio_language AS language FROM game_fullaudiolanguages
                  ORDER BY language ASC;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);

  });
});



// ------------------------------------------------ QUERY ONE ------------------------------------------------
router.get('/get-avg-price-rollup', (req, res) => {
  const query = 
     `SELECT 	YEAR(release_date) AS release_year, 
			        Ifnull(genre, 'YEAR AVE') AS genre, 
			        ROUND(AVG(price), 2) AS average_price,
              COUNT(g.appid) AS game_count
      FROM		games g
      JOIN 		game_genres gg
      ON			g.AppID = gg.AppID
      WHERE 	release_date IS NOT NULL
      AND			NOT YEAR(release_date) = 2025
      GROUP BY 	release_year, genre WITH ROLLUP
      ORDER BY 	release_year, genre ASC;`

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['release_year', 'genre','average_price', 'game_count'] , rows: results});

  });
});


router.get('/get-avg-price-drilldown', (req, res) => {
  var year = req.query.year;
  const query = 
  `SELECT  MONTH(release_date) AS release_month,
          ROUND(AVG(price), 2) AS average_price,
          COUNT(g.appid) AS game_count
    FROM games g
    JOIN game_genres gg on g.AppID = gg.AppID
    WHERE YEAR(release_date) = ?
    GROUP BY release_month
    ORDER BY release_month ASC;`

  db.query(query, [year], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['release_month','average_price', 'game_count'] , rows: results});

  });
});

router.get('/get-avg-price-slice', (req, res) => {
  var genre = req.query.genre;
  const query = 
  `SELECT 	YEAR(release_date) AS release_year, 
            ROUND(AVG(price), 2) AS average_price,
            COUNT(g.appid) AS game_count
    FROM 	games g
    JOIN 	game_genres gg on g.AppID = gg.AppID
    WHERE 	genre = ?
    AND			NOT YEAR(release_date) = 2025
    GROUP BY release_year
    ORDER BY release_year;`

  db.query(query, [genre], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['release_year', 'average_price', 'game_count'] , rows: results});

  });
});

router.get('/get-avg-price-dice', (req, res) => {
  var year = req.query.year;
  var genre = req.query.genre;
  const query = 
  `SELECT MONTH(release_date) AS release_month, 
           ROUND(AVG(price), 2) AS average_price,
           COUNT(g.appid) AS game_count
    FROM games g
    JOIN game_genres gg on g.AppID = gg.AppID
    WHERE YEAR(release_date) = ? AND genre = ?
    GROUP BY release_month
    ORDER BY release_month;`

  db.query(query, [year, genre], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['release_year', 'average_price', 'game_count'] , rows: results});

  });
});


// ------------------------------------------------ QUERY TWO ------------------------------------------------
router.get('/get-audio-support-rollup', (req, res) => {
  const query = 
     `SELECT      IFNULL(gfl.fullaudio_language, 'GRAND TOTAL') AS fullaudio_language,
                  IFNULL(YEAR(g.release_date), 'Language Total') AS release_year,
                  COUNT(g.appid) AS game_count
      FROM        games g
      JOIN        game_fullaudiolanguages gfl ON g.appid = gfl.appid
      WHERE       g.release_date IS NOT NULL
      GROUP BY    fullaudio_language, release_year WITH ROLLUP
      ORDER BY    gfl.fullaudio_language, release_year;`

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['fullaudio_language', 'release_year', 'game_count'] , rows: results});

  });
});


router.get('/get-audio-support-drilldown', (req, res) => {
  var year = req.query.year;
  const query = 
     `SELECT	gfl.fullaudio_language AS fullaudio_language,   
              Month(g.release_date) AS release_month,
              Count(g.appid) AS game_count
      FROM     games g
      JOIN     game_fullaudiolanguages gfl
      ON       g.appid=gfl.appid
      WHERE   g.release_date IS NOT NULL
      AND		YEAR(g.release_date) = ?
      GROUP BY fullaudio_language, release_month WITH ROLLUP
      ORDER BY gfl.fullaudio_language, release_month ASC;`

  db.query(query, [year], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }

      res.json({ columns: ['fullaudio_language', 'release_month', 'game_count'] , rows: results});

  });
});


module.exports = router;
