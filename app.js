var express = require("express");
const util = require('util');
var app = express();

var fs = require("fs");

var multer = require("multer");
var upload = multer({dest: "./uploads"});

var mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/nodeJs");
var conn = mongoose.connection;
var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  app.get("/", function(req,res){
    //renders a multipart/form-data form
    res.render("index");
  });

  //second parameter is multer middleware.
  app.post("/", upload.single("avatar"), function(req, res, next){
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
	  
	  var collection = mongoose.connection.db.collection('usercollection');

	  collection.insert({
	        "username" : req.body.username
	    }, function (err, doc) {
	        if (err) {
	            res.send("There was a problem adding the information to the database.");
	        }	        
	    });
	  
    var writestream = gfs.createWriteStream({
      filename: req.file.originalname
    });
    
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
      .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.send("success")})})
        .on("err", function(){res.send("Error uploading image")})
          .pipe(writestream);
  });
  
  app.get("/imageUpload", function(req,res){
	    //renders a multipart/form-data form
	    res.render("image");
	  });

	  //second parameter is multer middleware.
	  app.post("/imageUpload", upload.single("imagefile"), function(req, res, next){
	    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
		  
		  var collection = mongoose.connection.db.collection('usercollection');

		  collection.insert({
		        "username" : req.body.username
		    }, function (err, doc) {
		        if (err) {
		            res.send("There was a problem adding the information to the database.");
		        }	        
		    });
		  
	    var writestream = gfs.createWriteStream({
	      filename: req.file.originalname
	    });
	    console.log("filename"+filename);
	    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
	    fs.createReadStream("./uploads/" + req.file.filename)
	      .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.render("success")})})
	        .on("err", function(){res.render("error")})
	          .pipe(writestream);
	  });
	  
//sends the image we saved by filename.
  app.get("/:filename", function(req, res){
      var readstream = gfs.createReadStream({filename: req.params.filename});
      readstream.on("error", function(err){
        res.send("No image found with that title");
      });
      readstream.pipe(res);
  });
  
});

app.set("view engine", "ejs");
app.set("views", "./views");

if (!module.parent) {
  app.listen(3000);
}