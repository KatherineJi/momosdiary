/**
 * Created by Momo on 15/8/5.
 */
var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
var db_name = 'YmtkddjHYDqLAwcKaNoh'; //数据库名称
var db_host = 'mongo.duapp.com'; //数据库地址
var db_port = '8908'; // 数据库端口
var username = 'ebf90fdcb5944aa0bb9b325fc98b1486'; //用户AK
var password = 'a6a91fea23284e6a9e7b9a6135207055'; //用户SK

//设置数据库名、数据库地址和数据库端口创建了一个数据库连接实例
module.exports = new Db(db_name, new Server(db_host, db_port, {}), {w: 1});