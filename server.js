//  Setup
var _ = require('underscore'),
    http = require('http'),
    path = require('path')
var config = require('./config')

var express = require('express'),
    bodyParser = require('body-parser');
var app = express(); app.use(bodyParser.json())
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var _ = require('underscore');

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:config.database.db_port, dialect: config.database.db_dialect,logging:false})

var pg = require('pg').native;

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

var connectedIndraClients = {};

//  Routes
app.get('/handshake', function(req, res){
  res.json({time:new Date()} )
});

app.route('/')
.get(function(req, res, next){
  res.sendFile('index.html', 
    { root: path.join(__dirname, 'public') });
})
.post(function(req, res, next) {
  processData(req.body)
  res.json({status:'ok'}); //return confirmation of receipt
})
app.route('/chart')
.get(function(req, res, next){
  res.sendFile('chart.html', 
    { root: path.join(__dirname, 'public') });
})

http.listen(config.port_number, function(){
  console.log('server up. listening on ' + config.port_number);
});

//  Socket.io

io.on('connection', function(socket) {
  
  socket.on('disconnect', function() {
  })

})

// Handle Data

function processData(d) {
  // store in database
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

    connectedIndraClients[d.username] = moment();
    
    io.emit('indraData', "User: " + d.username + " ... Attention: " + d.attention_esense)
  
  }); 
}

setInterval(function() {

  recentUsers = [];

  for (var userKey in connectedIndraClients) {
    if (connectedIndraClients[userKey].diff() < -15000) {
      delete connectedIndraClients[userKey];
    }
    
    recentUsers.push(userKey);

  }

  io.emit('recentUsers', recentUsers);

}, 15000)



