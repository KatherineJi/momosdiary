/**
 * Created by Momo on 15/8/5.
 */
var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

var username = 'ebf90fdcb5944aa0bb9b325fc98b1486'; //用户AK
var password = 'a6a91fea23284e6a9e7b9a6135207055'; //用户SK

module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
    //要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    //打开数据库
    mongodb.open(function(err,db){
        console.log("enter open mongodb");
        db.authenticate(username, password, function(err, result) {
        if(err){
            console.log("OPEN error");
            return callback(err);//错误，返回err信息
        }
        console.log("OPEN success");
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);//错误，返回err信息
            }
            //将用户数据插入users集合
            collection.insert(user,{
                safe:true
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);//错误，返回err信息
                }
                callback(null, user);//成功！err为null，并返回存储后的用户文档
            });
        });
        });
    });
};

//读取用户信息
User.get = function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        console.log("enter open mongodb");
        db.authenticate(username, password, function(err, result) {
        if(err){
            console.log("OPEN error");
            return callback(err);
        }
        console.log("OPEN success");
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找用户名（name键）值为name的一个文档
            collection.findOne({
                name:name
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);
            });
        });
        });
    });
};