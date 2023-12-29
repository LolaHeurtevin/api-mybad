var express = require('express');
var router = express.Router();
var db = require('../db');
var hal = require('../hal')

/* GET home page. */
router.get('/', async function (req, res, next) {

  // #swagger.summary = "Page d'accueil"

  const conn = await db.mysql.createConnection(db.dsn);

  try {
    
    const [rows] = await conn.execute('SELECT * FROM User');

    const users = rows.map(element => {
      return {
        pseudo: element.pseudo
      }
    });
    res.render('index', { title: 'MyBad', 'users': users });

  } catch (error) {
    console.error('Error connecting: ' + error.stack);
    res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });

  }
});

module.exports = router;
