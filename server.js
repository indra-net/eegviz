var _ = require('underscore'),
    http = require('http'),
    path = require('path')
var config = require('./config')

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:5432, dialect: 'postgres',logging:false})
var pg = require('pg').native;

var Reading = sequelize.define('Reading', {
  username: Sequelize.STRING,
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  raw_data: Sequelize.ARRAY(Sequelize.FLOAT),
  attention_esense: Sequelize.INTEGER,
  meditation_esense: Sequelize.INTEGER,
  eeg_power: Sequelize.ARRAY(Sequelize.FLOAT),
}); Reading.sync()

var app = require('express')();
var http = require('http').Server(app);

app.get('/handshake', function(req, res){
  res.json({time:new Date()} )
});

app.get('/', function(req, res){
  res.sendFile('index.html', 
    { root: path.join(__dirname, 'public') });
});

app.post('/', function(req, res) {
  saveData(req);
  res.end();
});

http.listen(config.port_number, function(){
  console.log('listening on ' + config.port_number);
});


function saveData(postRequest) {
  var d = JSON.parse(data)
  var reading = Reading.create({
          username: 	d.username,
          start_time:     d.start_time,
          end_time:    	d.end_time,
  	  signal_quality: d.signal_quality,
          raw_data:  	d.raw_data,
          attention_esense:  d.attention_esense,
          meditation_esense:  d.meditation_esense,
          eeg_power:  d.eeg_power,
  }) .error(function(err) {
            console.log(err)
  }).success(function() {
            console.log(d.username)
  });
}
