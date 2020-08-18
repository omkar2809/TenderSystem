var express = require('express');
const cors = require('../util/cors');
var router = express.Router();

/* GET home page. */
router.get('/',  cors.corsWithOptions, (req, res, next) => {
  res.render('index', { title: 'Welcome to Tender System Project !!!!!' });
});

module.exports = router;
