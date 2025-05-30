const express = require('express');
const VideoMeta = require('../schemas/VideoMeta');
const _ = require('lodash');
const router = express.Router();

// GET /search?q=some-tag
router.get('/', async (req, res) => {
  const query = req.query.q;

  const videos = await VideoMeta.find({
    $or: [
      { title: new RegExp(_.escapeRegExp(query), 'i') },
      { description: new RegExp(_.escapeRegExp(query), 'i') },
      { tags: { $in: [query] } }
    ]
  });

  res.render('search-results', { videos });
});

module.exports = router;
