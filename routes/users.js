var express = require('express');
const axios = require("axios");
const Redis = require('ioredis');

var router = express.Router();
//todo demo redis
const client = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

function hardPullAndResponse(searchTerm, res){
  console.log("hardpull")
  client.del(searchTerm, (error, result)=>{
    if (error) {
      console.log(error)
      return;
    }
    console.log(result);
    softPullAndResponse(searchTerm, res);
  });
}

function softPullAndResponse(searchTerm, res) {
  try {
    client.get(searchTerm, async (err, jobs) => {
      if (err) throw err;
      if (jobs) {
        console.log("from cache")
        res.status(200).send(jobs);
      }
      else {
        const jobs = await axios.get(`https://jsonplaceholder.typicode.com/posts/1/comments`);
        client.setex(searchTerm, 100000, JSON.stringify(jobs.data));
        console.log("hard pull")
        res.status(200).send(jobs.data);
      }
    });
  } catch (err) {
    res.status(500).send({ message: "invalid handler" });
  }
}


router.get('/', function (req, res, next) {
  console.log("get /user" + req.query.title)
  const searchTerm = req.query.title
  softPullAndResponse(searchTerm, res)
});

router.get('/:id', function (req, res, next) {
  console.log(req.params.id)
  const searchTerm = req.params.id;
  softPullAndResponse(searchTerm, res)
});

router.get('/:id/:now', function (req, res, next) {
  console.log(req.params.id)
  console.log(req.params.now)
  const searchTerm = req.params.id;
  hardPullAndResponse(searchTerm, res)
});

router.post('/:id', function (req, res, next) {
  console.log(req.params.id)
  const searchTerm = req.params.id;
  hardPullAndResponse(searchTerm, res)
});

module.exports = router;
