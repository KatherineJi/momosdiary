/**
 * Created by Momo on 15/8/5.
 */
var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

//设置数据库名、数据库地址和数据库端口创建了一个数据库连接实例
module.exports = new Db(settings.db_name, new Server(settings.db_host, settings.db_port, {}), {w: 1});