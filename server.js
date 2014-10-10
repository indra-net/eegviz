// 0  setup
var _ = require('underscore'),
    http = require('http'),
    path = require('path')
var config = require('./config')

var express = require('express'),
    bodyParser = require('body-parser');
var app = express(); app.use(bodyParser.json())
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:config.database.db_port, dialect: config.database.db_dialect,logging:false})
var pg = require('pg').native;

var recent_data = { }


//  1   data 
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


//  2    routes
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

io.on('connection', function(socket) {
   
   socket.emit('attention_average', function() {
       // this is where you send average attention to a new user
   })
   
   socket.on('whats the data', function() {
      socket.emit('heres the data', JSON.stringify(recent_data))
    })
  
   socket.on('send_application_type', function(msg) {
      socket.application_type = msg;
      console.log ('requested application type: ' + socket.application_type);
    })

    socket.on('disconnect', function() {
       //for example: remove socket.username from userlist
    })
 
   console.log('new connection from webpage');
})

http.listen(config.port_number, function(){
  console.log('listening on ' + config.port_number);
});



function processData(d) {
  // store in database
  var reading = Reading.create({
    username:             d.username,
    start_time:           d.start_time,
    end_time:             d.end_time,
    //signal_quality:       d.signal_quality,
    raw_values:           d.raw_values,
    attention_esense:     d.attention_esense,
    meditation_esense:    d.meditation_esense,
    eeg_power:            d.eeg_power,
  }).error(function(err) {
    console.log(err)
  }).success(function() {
    // safe to store in object
    // TODO: send to python and store in object there? feature extraction?
    recent_data[d.username] = { attention:d.attention_esense,
                                time:d.end_time,}
    console.log(d.username)
  });
}
   










