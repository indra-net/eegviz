// setup
var _ = require('underscore'),
    http = require('http'),
    path = require('path')
var config = require('./config')

var express = require('express'),
    bodyParser = require('body-parser');
var app = express(); app.use(bodyParser.json())
var http = require('http').Server(app);

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:5432, dialect: 'postgres',logging:false})
var pg = require('pg').native;



//   1    models
var Reading = sequelize.define('Reading', {
  username: Sequelize.STRING,
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  raw_values: Sequelize.ARRAY(Sequelize.INTEGER),
  attention_esense: Sequelize.INTEGER,
  meditation_esense: Sequelize.INTEGER,
  eeg_power: Sequelize.ARRAY(Sequelize.INTEGER),
}); Reading.sync()



//    2    routes
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

http.listen(config.port_number, function(){
  console.log('listening on ' + config.port_number);
});



//    3    data processing workflow
function processData(d) {
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
            console.log(d.username)
  });
}
