/**
 * Created by Momo on 15/8/8.
 */
var mongodb = require('./db');

function Comment(author, time, title, comment){
    this.author = author;
    this.time = time;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言
Comment.prototype.save = function(callback){
    var author = this.author,
        time = this.time,
        title = this.title,
        comment = this.comment;
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取articles集合
        db.collection('articles', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //通过用户名、时间、标题查找，并把一条留言添加到文档的comments数组里
            collection.update({
                "author": author,
                "time.day": time,
                "title": title
            }, {
                $push: {"comments": comment}
            }, function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};