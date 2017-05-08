var express = require("express");
var http = require("http");
var app = express();
var path = require("path");
var db = require("./db");
var rand = require("./rand");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
  extended:false}));
  app.use(bodyParser.json());
  app.set("views", "./views");
  app.set("view engine", "pug");

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", function(req, res) {

    res.render("index");
  });

  app.get("/:id", function(req, res) {
    var id = req.params.id;
    db.getConnection(function(err, connection) {
      connection.query("SELECT fullurl FROM shortener WHERE shortenedurl = ?", id, function (err, results){

        if (results.length > 0){
          res.redirect(results[0].fullurl);
        }
        connection.release();
        if(!results.length){
          res.end("There's no such link!");
        }
        if (err) throw err;
      });
    });
  });
  app.post("/", function(req, res) {
    var userurl = req.body.usrurl;
    var short = rand();
    var post = {fullurl: userurl, shortenedurl: short};
    var currentUrl = req.protocol + '://' + req.get("host");
db.getConnection(function(err, connection) {
    connection.query("INSERT IGNORE INTO shortener SET ?", post, function (err, results) {
      connection.release();
      if (err) throw err;
    });
    });
    db.getConnection(function(err, connection) {
    connection.query("SELECT shortenedurl FROM shortener WHERE fullurl = ?", userurl, function (err, results){

      var fullink = currentUrl + "/" + results[0].shortenedurl;
      res.render("index", {message: fullink});
      connection.release();
      if (err) throw err;
    });
  });
});
  app.listen(process.env.PORT || 5000);
