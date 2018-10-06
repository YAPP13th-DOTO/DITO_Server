var express = require('express');
var router = express.Router();
var url = require('url');
var querystring = require('querystring');

var mysql = require("mysql");

var client = mysql.createConnection({
    host : process.env.RDS_HOSTNAME, port: process.env.RDS_PORT,  user:process.env.RDS_USERNAME, password:process.env.RDS_PASSWORD
    // host : "aa11q9sjl4yh0a7.cgpltqpw2l6i.ap-northeast-2.rds.amazonaws.com"
    // , port: 3306,  user:"dito", password:"masterjh", database:"ebdb"

});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.floor(Math.random() * possible.length)));

    return text;
}


/* GET home page. */
router.get('/', function(req, res, next) {

    client.query("show tables;", function (err, result) {
        if(err){
            res.send("is not connect");
        }
        else{
            res.json(result);
        }
    });
});

router.get('/login', function (req,res) {


    client.query("SELECT * FROM User where kakao_code='" + req.query.id+"';", function (err, result, fields) {
        if (err) {
            res.send("SELECT * FROM User where kakao_code='" + req.query.id+"';");
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            req.session.user_id = req.query.id;
            req.session.name = 'a';
            if(req.session.count)
                req.session.count++;
            else
                req.session.count = 1;
            res.json(result);
        }
    });
});

router.get('/join', function (req,res) {
    client.query("INSERT INTO User values('" + req.query.id+"' , '"+ req.query.name +"' , '"+ req.query.val+"');", function (err, result, fields) {
        if (err) {
            res.send(err.stack);
        }
        else {
            res.send('access');
        }
    });
});

//team 만들기
router.get('/create', function (req,res) {

    console.log(req.session.user_id);
    var random = makeid();
    client.query("INSERT INTO teamroom values('" +random +"' , '"+ req.query.name +"','"+ 0+"');", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            res.send('access');
        }
    });
    //return code
});

//과제 만들기
router.get('/create/assign', function (req,res) {
    client.query("INSERT INTO teamassignment values('" +1 +"' , '"+ 2 +"','"+ 0+"','"+0+"',"+1+");", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            res.send('access');
        }
    });
});

//team list
router.get('/get', function (req,res) {
    console.log(req.session.count);
    res.send('get teamlist');

});

//선택한 팀
router.get('/get/team', function (req,res) {
    res.send('get team');

});

//과제 목록
router.get('/get/team/assign', function (req,res) {
    res.send('get assi');

});

//선택한 과제
router.get('/get/assign', function (req,res) {
    res.send('select assi');
});

module.exports = router;