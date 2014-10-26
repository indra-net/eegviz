var config = {}

config.port_number = 11014;

config.database = {}
config.database.username = process.env.DB_USERNAME || 'admen';
config.database.password=  process.env.DB_PASSWORD || 'n1ce,,';
config.database.db_name=  process.env.DB_NAME || 'eegviz_development';
config.database.db_port= 5432;
config.database.db_dialect= 'postgres';


module.exports = config;