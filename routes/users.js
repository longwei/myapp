var express = require('express');
const axios = require("axios");
const Redis = require('ioredis');

var router = express.Router();
//todo demo redis
const client = new Redis({
  host: '127.0.0.1',
  port: 6379,
});



function fetchAndRender(searchTerm, res) {
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
          name: 'from cache',
          array: JSON.parse(jobs)
        };
        res.render('account', demo);
      }
      else {
        console.log("cache miss, pulling new data")
        const jobs = await axios.get(`https://jsonplaceholder.typicode.com/posts/1/comments`);
        client.setex(searchTerm, 100000, JSON.stringify(jobs.data));

        // console.log(jobs.data);
        const demo = {
          postId: searchTerm,
          id: 1,
          name: 'hardpull',
          array: jobs.data
        };
        res.render('account', demo);
      }
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}


router.get('/', function (req, res, next) {
  console.log("??=>" + req.query.title)
  const searchTerm = req.query.title
  fetchAndRender(searchTerm, res)
});

router.get('/:id', function (req, res, next) {
  console.log(req.params.id)
  const searchTerm = req.params.id;
  fetchAndRender(searchTerm, res)
});

router.post('/:id', function (req, res, next) {
  console.log(req.params.id)
  const searchTerm = req.params.id;
  client.del(searchTerm, (error, result)=>{
    if (error) {
      console.log(error)
      return;
    }
    console.log(result);
    fetchAndRender(searchTerm, res);
  });
});

module.exports = router;
