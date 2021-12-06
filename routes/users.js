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
  console.log("??=>"+req.query.title)
  const searchTerm = req.query.title
  try {
      client.get(searchTerm, async (err, jobs) => {
          if (err) throw err;

          //TODO render not json
          if (jobs) {
              // res.render("account", {title: 'title'});
              // console.log(Array.isArray(JSON.parse(jobs)))
              const demo = {
                postId: searchTerm,
                id: 1,
                name: 'id labore ex et quam laborum',
                email: 'Eliseo@gardner.biz',
                body: 'laudantium enim quasi est quidem magnam voluptate ipsam eos\n' +
                  'tempora quo necessitatibus\n' +
                  'dolor quam autem quasi\n' +
                  'reiciendis et nam sapiente accusantium',
                array: JSON.parse(jobs)
              };
              // console.log(demo)
              // console.log(JSON.parse(jobs)[0]);
              res.render('account', demo);
              // res.status(200).send({
              //     jobs: JSON.parse(jobs),
              //     message: "data retrieved from the cache"
              // });
          }
          else {
              console.log("cache miss")
              const jobs = await axios.get(`https://jsonplaceholder.typicode.com/posts/1/comments`);
              client.setex(searchTerm, 100000, JSON.stringify(jobs.data));
              res.render('account', { title: 'cache miss' });
              // res.status(200).send({
              //     jobs: jobs.data,
              //     message: "cache miss"
              // });
          }
      });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
});



/* GET users listing. */
router.get('/:id', function(req, res, next) {
  console.log(req.params.id)
  res.send('soft pull id' + req.params.id);
});

/* GET users listing. */
router.post('/:id', function(req, res, next) {
  console.log(req.params.id)
  res.send('hard pull id' + req.params.id);
});

module.exports = router;
