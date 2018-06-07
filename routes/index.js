var express = require('express');
var router = express.Router();
var fs = require('fs');

//Get HOME PAGE *************************************************************************************
router.get('/', function(req, res) {
  res.render('index');
});

//GET REGISTER PAGE ********************************************************************************
router.get('/register', function(req, res) {
  res.render('register');
});

//GET LOGIN PAGE ***********************************************************************************
router.get('/login', function(req, res) {
  res.render('login');
});


//GET DRAW PAGE ************************************************************************************
router.get('/draw', function(req, res) {
  res.render('drawContour');
});


//REGISTER A USER **************************************UNFINISHED**********************************
router.post('/register', function(req, res) {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  console.log('Your name is: ' + name + 'and your username is ');
})

//SIGN IN A USER ***************************************UNFINISHED***********************************
router.post('/login', function(req, res) {

  //var name  = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  //var password2 = req.body.password2;
  console.log('Your username is: ' + username + 'and your password is: ' + password);
})

//UPLOAD USER INPUT TO THE SERVER *******************************************************************
router.post('/upload', function(req, res) {
  var contourData = req.body.canvas;//canvas data
  var videoName = fs.readFileSync('file/index.txt', 'utf8');
  //update the index for next video upload
  var index = parseInt(videoName);
  videoName = 'V_' + videoName + '.mp4';//video name uploaded
  var videoPathName = 'file/' + videoName;
  index = index + 1; //increse the name index by one to keep the name of the video unique
  videoName = index.toString();
  //write the updated index to the file 
  fs.writeFile('file/index.txt', videoName, function(err) {
    if (err)
      return console.log('The index has NOT been updated');
    else
      return console.log('The index has been updated');
  });
  let newVideo = req.files.ultrasound_video;
  // Use the mv() method to place the video under file dir under the project on the server
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  newVideo.mv(videoPathName, function(err) {
    if (err)
      return res.status(500).send(err);
    res.send('file uploaded');
  });
});

//EXPORT A MODULE ***********************************************************************************
module.exports = router;