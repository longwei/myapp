var express = require('express');
const axios = require("axios");
const Redis = require('ioredis');

var router = express.Router();
//todo demo redis
const client = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

router.get('/', function(req, res, next) {
  console.log(req.query.title)
  const searchTerm = req.query.title
  try {
      client.get(searchTerm, async (err, jobs) => {
          if (err) throw err;

          //TODO render not json
          if (jobs) {
              console.log("got from cache")
              // res.render("account", {title: 'title'});
              // res.render('index', { title: 'longwei' });
              res.status(200).send({
                  jobs: JSON.parse(jobs),
                  message: "data retrieved from the cache"
              });
          }
          else {
              console.log("cache miss")
              const jobs = await axios.get(`https://jsonplaceholder.typicode.com/posts/1/comments`);
              client.setex(searchTerm, 60, JSON.stringify(jobs.data));
              // res.render('index', { title: 'longwei' });
              res.status(200).send({
                  jobs: jobs.data,
                  message: "cache miss"
              });
          }
      });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
});






/* GET users listing. */
// router.post('/', function(req, res, next) {
//   console.log(req.body.title)
//   res.send('fetching id' + req.body.title);
// });
module.exports = router;
