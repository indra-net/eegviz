var _ = require('underscore'),
    http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');
var config = require('./config')


//database
var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.database.db_name,config.database.username,config.database.password, 
	{port:5432, dialect: 'postgres',logging:false})
var pg = require('pg').native;

var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.send('index.html');
});

http.listen(11014, function(){
  console.log('listening');
});
