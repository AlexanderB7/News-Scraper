const express = require("express");
var router = express.Router();

// Scraping and display tools
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("../models");

router.get("/", function(req, res) {
  res.render("index");
});

router.get("/saved", function(req, res) {
  db.Article.find({
    favorited: true
  })
    .then(function(dbArticle) {
      var hbsObject = {
        Articles: dbArticle
      };
      res.render("saved", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// New York Times Scraper
router.get("/scrape/nyt", function(req, res) {
  axios.get("https://www.nytimes.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("article h2").each(function(i, element) {
      // Save the text of the h4-tag as "title"
      var results = [];
      var articleSource = "NYT";
      var title = $(element).text();

      var subhead = $(element)
        .parent()
        .siblings("ul")
        .children("li")
        .first()
        .text();

      if (subhead === "") {
        var subhead = $(element)
          .parent()
          .siblings("p")
          .first()
          .text();
      }

      // Find the h4 tag's parent a-tag, and save it's href value as "link"
      var link = $(element)
        .parent()
        .parent()
        .attr("href");

      if (subhead === "") {
      } else {
        results.push({
          title,
          subhead,
          link: "https://www.nytimes.com" + link,
          articleSource
        });

        db.Article.create(results)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    });
  });
});

// Associated Press Scraper
router.get("/scrape/ap", function(req, res) {
  axios.get("https://www.apnews.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".FeedCard").each(function(i, element) {
      // Save the text of the h4-tag as "title"
      var results = [];
      var articleSource = "AP";
      var title = $(element)
        .children(".CardHeadline")
        .children(" a.headline")
        .children("h1")
        .text();

      var subhead = $(element)
        .children("a")
        .children("div .content")
        .children("p")
        .text();

      // Find the h4 tag's parent a-tag, and save it's href value as "link"
      var link = $(element)
        .children("a")
        .attr("href");

      // Make an object with data we scraped for this h4 and push it to the results array
      results.push({
        title,
        subhead,
        link: "https://www.apnews.com" + link,
        articleSource
      });

      db.Article.create(results)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  });
});

// Daily Wire Scraper
router.get("/scrape/dw", function(req, res) {
  axios.get("https://www.dailywire.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("article h2").each(function(i, element) {
      // Save the text of the h4-tag as "title"
      var results = [];
      var articleSource = "DW";
      var title = $(element).text();

      // Find the h4 tag's parent a-tag, and save it's href value as "link"
      var link = $(element)
        .children()
        .attr("href");

      // Make an object with data we scraped for this h4 and push it to the results array
      results.push({
        title,
        link: "https://www.dailywire.com" + link,
        articleSource
      });

      db.Article.create(results)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  });
});

router.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      var hbsObject = {
        Articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.get("/clear", function(req, res) {
  db.Article.deleteMany({
    favorited: false
  })
    .then(function(dbArticle) {
      res.redirect("/");
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.get("/fav/:id", function(req, res) {
  let id = req.params.id;
  db.Article.findOneAndUpdate(
    {
      _id: id
    },
    {
      favorited: true
    },
    {
      new: true,
      useFindAndModify: false
    },
    function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.redirect("/articles");
      }
    }
  );
});

router.get("/unfav/:id", function(req, res) {
  let id = req.params.id;
  db.Article.findOneAndUpdate(
    {
      _id: id
    },
    {
      favorited: false
    },
    {
      new: true,
      useFindAndModify: false
    },
    function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.redirect("/saved");
      }
    }
  );
});

module.exports = router;