//  Setup
var _ = require('underscore'),
    path = require('path'),
    config = require('./config'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http').Server(app),
    request = require('request'),
    io = require('socket.io')(http),
    Sequelize = require('sequelize'),
    pg = require('pg').native,
    memwatch = require('memwatch');

app.use(bodyParser.json())

var sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:config.database.db_port, dialect: config.database.db_dialect,logging:false})

//  Data Architecture

var Reading = sequelize.define('Reading', {
  username: Sequelize.STRING,
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  raw_values: Sequelize.ARRAY(Sequelize.INTEGER),
  attention_esense: Sequelize.INTEGER,
  meditation_esense: Sequelize.INTEGER,
  eeg_power: Sequelize.ARRAY(Sequelize.INTEGER),
  //signal_quality: Sequelize.INTEGER,
}); Reading.create(); Reading.sync()

/*var Muse = sequelize.define('Muse', {
  //raw_values: Sequelize.ARRAY(Sequelize.INTEGER)
}); Muse.create(); Muse.sync()*/

var Event = sequelize.define('Event', {
  name: Sequelize.STRING,
  start_time: Sequelize.DATE
}); Reading.create(); Event.sync()

//  Routes

app.get('/handshake', function(req, res){
  res.json({time:new Date()} )
});

app.get('/db-update', function(req, res) {
  checkDB()
});

app.route('/')
  .get(function(req, res, next){
    res.sendFile('chart.html', 
      { root: path.join(__dirname, 'public') });
  })

  .post(function(req, res, next) {
    processData(req.body)
    res.json({status:'ok'});
  })

/*app.route('/muse')
  .post(function(req, res, next) {
    processMuse(req.body)
    res.json({status:'ok'}); //return confirmation of receipt
  })*/

app.route('/event')
  .post(function(req, res, next) {
    saveEvent(req.body)
    res.json({status:'ok'}); //return confirmation of receipt
  })

/*app.route('/chart')
.get(function(req, res, next){
  res.sendFile('chart.html', 
    { root: path.join(__dirname, 'public') });
})*/

http.listen(config.port_number, function(){
  console.log('Server listening on ' + config.port_number);
});

// Initialize variables

var connectedIndraClients = {};
var recentUsers = [];
//var recentData = [];

function processData(d) {
  
  // Store indra-client stream in database

  var reading = Reading.create({
    username:             d.username,
    start_time:           d.start_time,
    end_time:             d.end_time,
    signal_quality:       d.signal_quality,
    raw_values:           d.raw_values,
    attention_esense:     d.attention_esense,
    meditation_esense:    d.meditation_esense,
    eeg_power:            d.eeg_power,
  }).error(function(err) {
    console.log(err)
  }).success(function() {

    // user:time helper object to inform recentUsers array
    connectedIndraClients[d.username] = new Date();
    // Append to recentData array of objects that will be shipped to python
    //recentData.push({'username':d.username, 'start_time':d.start_time,'end_time':d.end_time,'data':d.raw_values})
    // Emit indra-client data stream to web clients
    io.emit('indraData', [{"username": d.username, "attention_esense": d.attention_esense}])

  }); 
}

/*function processMuse(d) {
  var museEvent = Muse.create({
    // save to db

  }).error(function(err) {
    console.log(err)
  }).success(function() {
    // do stuff
  })
}*/

function saveEvent(d) {
  var stimEvent = Event.create({
    name:          d.name,
    start_time:    d.start_time, 
  }).error(function(err) {
    console.log(err)
  }).success(function() {
    console.log(d.name + ' saved');
  });
}

function checkDB() {
  // Get last four rows since most recent blink event
  sequelize
    .query('SELECT count(*) FROM P300')
    .success(function(rows) {
      console.log(rows);
    })

  /*sequelize
    .query('SELECT * FROM P300 WHERE ')
    .success(function(pyData) {
      console.log(pyData);
    })

  // Emit socket data to web client
  io.emit('P300', pyData);*/

}

// Interval Timer

setInterval(function() {
  // Update Recent Users for Web Client
  var now = new Date();
  for (var userKey in connectedIndraClients) {
    if (connectedIndraClients[userKey] - now < -10000) {
      delete connectedIndraClients[userKey];
    }
    recentUsers.push(userKey);
  }
  
  if (recentUsers.length > 0) {
    io.emit('recentUsers', recentUsers);
    recentUsers = [];
  }

  // Poll DB Python Schema

  checkDB();


}, 5000)

// Memory Leak Debugger

/*memwatch.on('stats', function(stats) {
  console.log(JSON.stringify(stats));
})*/

















