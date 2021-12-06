var express = require('express');
const axios = require("axios");
const Redis = require('ioredis');

var router = express.Router();
const client = new Redis({
    host: '127.0.0.1',
    port: 6379,
});


router.get('/:id', function(req, res, next) {
  console.log(req.body)
  res.send('getting /' + req.params.id);
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(req.body.title)
  res.send('fetching id' + req.body.title);
});








module.exports = router;
