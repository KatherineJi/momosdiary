/**
 * Created by Momo on 15/8/5.
 */
var mongodb = require('./db');
var settings = require('../settings');
var markdown = require('markdown').markdown;

function Article(title,author,tags,content){
    this.title = title;
    this.author = author;
    this.tags = tags;
    this.content = content;
}

module.exports = Article;

//存储一篇文章及相关信息
Article.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式，方便以后拓展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: (date.getFullYear() + "-" + (date.getMonth()+1)),
        day: (date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()),
        minute: (date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes()))
    };
    //要存入数据库的文档
    var article = {
        title: this.title,
        author: this.author,
        tags: this.tags,
        content: this.content,
        time: time,
        comments: [],
        reprintInfo: {},
        pv: 0
    };
    //打开数据库
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //将文档插入articles集合
                collection.insert(article, {
                    safe: true
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};

//读取文章及其相关信息
Article.getTen = function(author,page,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                var query = {};
                if (author) {
                    query.author = author;
                }
                //使用count返回特定查询的文章数total
                collection.count(query, function (err, total) {
                    //根据query对象查询，并跳过前(page-1)*10个结果，返回之后的10个结果
                    collection.find(query, {
                        skip: (page - 1) * 5,
                        limit: 5
                    }).sort({
                        time: -1
                    }).toArray(function (err, docs) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                        //解析markdown为HTML
                        docs.forEach(function (doc) {
                            doc.content = markdown.toHTML(doc.content);
                        });
                        callback(null, docs, total);
                    });
                });
            });
        });
    });
};

//获取一篇文章
Article.getOne = function (author, time, title, callback) {
    //打开数据库
    mongodb.open(function(err,db) {
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //根据用户名，时间，文章名查询
                collection.findOne({
                    "title": title,
                    "author": author,
                    "time.day": time
                }, function (err, doc) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                    if (doc) {
                        //每访问一次，pv值增加1
                        collection.update({
                            'author': author,
                            'time.day': time,
                            'title': title
                        }, {
                            $inc: {'pv': 1}
                        }, function (err) {
                            mongodb.close();
                            if (err) {
                                return callback(err);
                            }
                        });
                        //解析markdown为html
                        doc.content = markdown.toHTML(doc.content);
                        doc.comments.forEach(function (comment) {
                            comment.content = markdown.toHTML(comment.content);
                        });
                    }
                    callback(null, doc);
                });
            });
        });
    });
};

//返回原始发表的内容(markdown格式)
Article.edit = function(author,time,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //根据用户名、日期、文章名查询
                collection.findOne({
                    "author": author,
                    "time.day": time,
                    "title": title
                }, function (err, doc) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, doc);//返回查询的一篇文章（markdown格式）
                });
            });
        });
    });
};

Article.update = function (author,time,title,content,callback) {
    //打开数据库
    mongodb.open(function(err,db) {
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //更新文章内容
                collection.update({
                    "author": author,
                    "time.day": time,
                    "title": title
                }, {
                    $set: {content: content}
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};

Article.remove = function(author, time, title, callback){
    //打开数据库
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //根据用户名、时间、标题查找删除某篇文章
                collection.remove({
                    "author": author,
                    "time.day": time,
                    "title": title
                }, {
                    w: 1
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};

//返回所有文章存档信息
Article.getArchive = function(callback){
    //打开数据库
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            //读取articles集合
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //返回只包含name,time,title属性的文档组成的存储数组
                collection.find({}, {
                    'author': 1,
                    'time.day': 1,
                    'title': 1
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, docs);
                });
            });
        });
    });
};

Article.getTags = function(callback){
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //distinct用来找出给定键的所有不同值
                collection.distinct('tags', function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, docs);
                });
            });
        });
    });
};

Article.getTag = function(tag,callback){
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.authenticate(settings.username, settings.password, function(err, result) {
            if (err) {
                return callback(err);
            }
            db.collection('articles', function (err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //查询所有tags数组内包含tag的文档
                //并返回只含有name\time\title组成的数组
                collection.find({
                    'tags': tag
                }, {
                    'author': 1,
                    'time.day': 1,
                    'title': 1
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, docs);
                });
            });
        });
    });
};

//返回通过标题关键字查询的所有文章信息
Article.search = function(keyword,callback){
    mongodb.open(function(err,db){
        if (err) {
            return callback(err);
        }
         db.authenticate(settings.username, settings.password, function(err, result) {
             if (err) {
                 return callback(err);
             }
             db.collection('articles', function (err, collection) {
                 if (err) {
                     mongodb.close();
                     return callback(err);
                 }
                 var pattern = new RegExp(keyword, 'i');
                 collection.find({
                     'title': pattern
                 }, {
                     'author': 1,
                     'time.day': 1,
                     'title': 1
                 }).sort({
                     time: -1
                 }).toArray(function (err, docs) {
                     mongodb.close();
                     if (err) {
                         return callback(err);
                     }
                     callback(null, docs);
                 });
             });
         });
    });
};