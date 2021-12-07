var express = require('express');
const axios = require("axios");
const Redis = require('ioredis');
const fs = require('fs');

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

function filter(rawdata_tmp){
  let rawdata = fs.readFileSync('./static/example.json');
  let ig = JSON.parse(rawdata);
  const account = {
      id: ig.graphql.user.id,
      biography: ig.graphql.user.biography,
      full_name: ig.graphql.user.full_name,
      followers_count: ig.graphql.user.edge_followed_by.count,

  }
  const edge_owner_to_timeline_media_edges = ig.graphql.user.edge_owner_to_timeline_media.edges

  const total = Object.keys(edge_owner_to_timeline_media_edges).length

  recent_posts = []
  for (let step = 0; step < total; step++) {
      // Runs 5 times, with values of step 0 through 4.
      const recent_post = ig.graphql.user.edge_owner_to_timeline_media.edges[step];
      const post = {
          post_id: recent_post.node.id,
          post_owner_id: recent_post.node.owner.id,
          post_typename: recent_post.node.__typename,
          post_displayurl: recent_post.node.display_url,
          post_likes: recent_post.node.edge_liked_by.count,
          post_comments: recent_post.node.edge_media_to_comment.count,
      }
      recent_posts[step] = post
  }
  let ret = {
      last_fetch: Date.now(),
      accountInfo:account,
      posts:recent_posts
  }
  return ret;
}

function softPullAndResponse(handler, res) {
  const searchTerm = "mavrckco";
  const igapi = "https://www.instagram.com/mavrckco/?__a=1";
  try {
    client.get(searchTerm, async (err, jobs) => {
      if (err) throw err;
      if (jobs) {
        res.status(200).send(jobs);
      }
      else {
        const jobs = await axios.get(igapi);
        console.log(jobs);

        const filtered_JSON = filter("return json")
        client.setex(searchTerm, 10, JSON.stringify(filtered_JSON));
        console.log("hard pull")
        res.status(200).send(filtered_JSON);
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

router.post('/:id', function (req, res, next) {
  console.log(req.params.id)
  const searchTerm = req.params.id;
  hardPullAndResponse(searchTerm, res)
});

module.exports = router;
