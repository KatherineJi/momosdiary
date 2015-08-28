//var express = require('express');
//var router = express.Router();
//
///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

var crypto = require('crypto'),
    User = require('../models/user.js'),
    Article = require('../models/article.js'),
    Comment = require('../models/comment.js');

var formidable = require('formidable'),
    fs = require('fs');
//var multer = require('multer');
//var upload = multer({dest:'../public/images'});

var routes = function (app) {
  app.get('/', function (req, res) {//首页
      var page = req.query.p ? parseInt(req.query.p) : 1;
      //查询并返回第page页的10篇文章
      Article.getTen(null, page, function(err,articles,total){
          if(err){
              articles = [];
          }
          res.render('index', {
              title: '主页',
              user: req.session.user,
              page: page,
              isFirstPage: (page-1)==0,
              isLastPage: ((page-1)*5+articles.length)==total,
              articles: articles,
              success: req.flash('success').toString(),
              error:req.flash('error').toString()
          });
      });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req,res){//登陆
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error:req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function(req,res){//登陆
      //生成密码的 md5 值
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      //检查用户是否存在
      User.get(req.body.name, function(err,user){
          if(!user){
              req.flash('error','用户不存在！');
              return res.redirect('/login');
          }
          //检查密码一致性
          if(user.password != password){
              req.flash('error','密码错误！');
              return res.redirect('/login');
          }
          //用户名密码都匹配后，将用户信息存入 session
          req.session.user = user;
          req.flash('success','登陆成功！');
          res.redirect('/');
      })
  });

  app.get('/register', checkNotLogin);
  app.get('/register', function(req,res){//注册
    res.render('register', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error:req.flash('error').toString()
    });
  });

  app.post('/register', checkNotLogin);
  app.post('/register', function(req,res){//注册
      var name = req.body.name,
          password = req.body.password,
          password_repeat = req.body['password-repeat'],
          email = req.body.email;
      //检验用户两次输入的密码一致性
      if(password_repeat != password){
          req.flash('error', '两次输入的密码不一致！');
          return res.redirect('/register');
      }
      //生成密码的 md5 值
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      var newUser = new User({
          name:name,
          password:password,
          email:email
      });
      //检查用户名是否已存在
      User.get(newUser.name, function(err,user){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          if(user){
              req.flash('error','用户已存在！');
              return res.redirect('/register');
          }
          //如果不存在则新增用户
          newUser.save(function(err,user){
              if(err){
                  req.flash('error',err);
                  return res.redirect('/register');
              }
              req.session.user = user;
              req.flash('success','注册成功！');
              res.redirect('/');
          });
      });
  });

  app.get('/post', checkLogin);
  app.get('/post', function(req,res){//发表
    res.render('post', {
        title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error:req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req,res){//发表
      var currentUser = req.session.user,
          tags = [req.body.tag1, req.body.tag2, req.body.tag3],
          article = new Article(req.body.title,currentUser.name,tags,req.body.content);
      article.save(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          req.flash('success','发布成功！');
          res.redirect('/');
      });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function(req,res){//登出
      req.session.user = null;
      req.flash('success','登出成功');
      res.redirect('/');
  });

  app.get('/upload', checkLogin);
  app.get('/upload', function(req,res){//上传
      res.render('upload', {
          title: '文件上传',
          user: req.session.user,
          success: req.flash('success').toString(),
          error:req.flash('error').toString()
      })
  });

  app.post('/upload', checkLogin);
  app.post('/upload', function(req,res){//上传
      var form = new formidable.IncomingForm();
      form.encoding = 'utf-8';		//设置编辑
      form.uploadDir = './public/images/';	 //设置上传目录
      form.keepExtensions = true;	 //保留后缀
      form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

      form.parse(req, function(err, fields, files) {

          if (err) {
              req.flash('error', '上传失败！');
              res.redirect('/upload');
              return;
          }

          var extName = '';  //后缀名
          switch (files.pic.type) {
              case 'image/pjpeg':
                  extName = 'jpg';
                  break;
              case 'image/jpeg':
                  extName = 'jpg';
                  break;
              case 'image/png':
                  extName = 'png';
                  break;
              case 'image/x-png':
                  extName = 'png';
                  break;
          }

          if(extName.length == 0){
              req.flash('error', '只支持png和jpg格式图片！');
              res.redirect('/upload');
              return;
          }

          console.log(files);

          var avatarName = files.pic.name;
          var newPath = form.uploadDir + avatarName;

          //console.log(newPath);
          fs.renameSync(files.pic.path, newPath);  //重命名
      });

      req.flash('success', '文件上传成功！');
      res.redirect('/');
  });

  app.get('/archive', function(req,res){
      Article.getArchive(function(err,articles){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('archive',{
              title: '存档',
              articles: articles,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });

  app.get('/tags', function(req,res){
      Article.getTags(function(err,articles){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('tags',{
              title: '标签',
              articles: articles,
              user:req.session.user,
              success:req.flash('success').toString(),
              error:req.flash('error').toString()
          });
      });
  });

  app.get('/tags/:tag',function(req,res){
      Article.getTag(req.params.tag, function(err,articles){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('tag',{
              title: 'TAG:'+req.params.tag,
              articles: articles,
              user: req.session.user,
              success:req.flash('success').toString(),
              error:req.flash('error').toString()
          });
      });
  });

  app.get('/links', function(req,res){
      res.render('links', {
          title: '友情链接',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
      });
  });

  app.get('/search',function(req,res){
      Article.search(req.query.keyword,function(err,articles){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('search',{
              title: 'SEARCH:'+req.query.keyword,
              articles: articles,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });

  app.get('/u/:name', function (req,res) {
      var page = req.query.p ? parseInt(req.query.p) : 1;
      //检查用户名是否存在
      User.get(req.params.name, function(err,user){
          if(!user){
              req.flash('error','用户不存在！');
              return res.redirect('/');
          }
          //查询并返回该用户所有文章
          Article.getTen(user.name, page, function(err,articles,total){
              if(err){
                  req.flash('error', err);
                  return res.redirect('/');
              }
              res.render('user', {
                  title: user.name,
                  articles: articles,
                  page:page,
                  isFirstPage:(page-1)==0,
                  isLastPage:((page-1)*5+articles.length)==total,
                  user: req.session.user,
                  success: req.flash('success').toString(),
                  error: req.flash('error').toString()
              });
          });
      });
  });
  app.get('/u/:name/:time/:title', function(req,res){
      Article.getOne(req.params.name, req.params.time, req.params.title, function(err,article){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('article', {
              title: req.params.title,
              article: article,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });

  app.post('/u/:name/:time/:title', function(req,res){
      var date = new Date(),
          time = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
      var comment = {
          author: req.body.author,
          email: req.body.email,
          website: req.body.website,
          time: time,
          content: req.body.content
      };
      var newComment = new Comment(req.params.name, req.params.time, req.params.title, comment);
      newComment.save(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('back');
          }
          req.flash('success','留言成功！');
          res.redirect('back');
      });
  });

  app.get('/edit/:name/:time/:title', checkLogin);
  app.get('/edit/:name/:time/:title', function(req,res){
      var currentUser = req.session.user;
      Article.edit(currentUser.name, req.params.time, req.params.title, function(err,article){
          if(err){
              req.flash('error', err);
              return res.redirect('back');
          }
          res.render('edit', {
              title: '编辑',
              article: article,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });

  app.post('/edit/:name/:time/:title', checkLogin);
  app.post('/edit/:name/:time/:title', function(req,res){
      var currentUser = req.session.user;
      Article.update(currentUser.name, req.params.time, req.params.title, req.body.content, function(err){
          var url = encodeURI('/u/'+req.params.name+'/'+req.params.time+'/'+req.params.title);
          if(err){
              req.flash('error',err);
              return res.redirect(url);
          }
          req.flash('success','修改成功！');
          res.redirect(url);
      });
  });

  app.get('/remove/:name/:time/:title', checkLogin);
  app.get('/remove/:name/:time/:title', function(req,res){
      var currentUser = req.session.user;
      Article.remove(currentUser.name, req.params.time, req.params.title, function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('back');
          }
          req.flash('success','删除成功！');
          res.redirect('/');
      });
  });

    app.use(function(req,res){
        res.render('404',{
            title: '404'
        });
    });
};



function checkLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','未登录！');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','已登录！');
        res.redirect('back');
    }
    next();
}

module.exports = routes;