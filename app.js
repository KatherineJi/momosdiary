var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

//
//链接mongodb
//var Db = require('mongodb').Db;
//var Server = require('mongodb').Server;
//var http = require('http');
//var db_name = 'YmtkddjHYDqLAwcKaNoh'; //数据库名称
//var db_host = 'mongo.duapp.com'; //数据库地址
//var db_port = '8908'; // 数据库端口
//var username = 'ebf90fdcb5944aa0bb9b325fc98b1486'; //用户AK
//var password = 'a6a91fea23284e6a9e7b9a6135207055'; //用户SK
//
//var db = new Db(db_name, new Server(db_host, db_port, {}), {
//    w: 1
//});

//启动时建立连接
// db.open(function(err, db) {
//     db.authenticate(username, password, function(err, result) {
//         if (err) {
//             db.close();
//             // res.end('Authenticate failed!');
//             console.log("open db false");
//             return;
//         }
//         console.log("open db");
//     });
// });
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var multer = require('multer');

var app = express();//生成一个express实例app

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录
app.set('view engine', 'jade');//设置视图模板引擎为jade
app.use(flash());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/logo.ico'));//设置/public/favicon.ico为favicon图标
app.use(logger('dev'));//加载日志中间件
app.use(bodyParser.json());//加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false }));//加载解析urlencoded请求体的中间件
app.use(cookieParser());//加载解析cookie的中间件
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));//设置public文件夹为存放静态文件的目录
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db_name,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 1},//1 days
  resave: false,
  saveUninitialized: true
  //store: new MongoStore({
  //  url: 'mongodb://mongo.duapp.com/YmtkddjHYDqLAwcKaNoh'
  //})
}));
var upload = multer({
  dest: './public/images',
  rename: function(fieldname,filename){
    return filename;
  }
});

// 路由控制器
routes(app);

// 捕获404错误，并转发到错误处理器
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// 开发环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 生产环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// 导出app实例供其他模块调用
module.exports = app;
