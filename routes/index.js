var express = require('express');
var router = express.Router();
var url = require('url');
var querystring = require('querystring');

var mysql = require("mysql");

var client = mysql.createConnection({
    host : process.env.RDS_HOSTNAME, port: process.env.RDS_PORT,  user:process.env.RDS_USERNAME, password:process.env.RDS_PASSWORD, database:"ebdb"
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

    client.query("show databases;", function (err, result) {
        if(err){
            res.send(err.stack);
        }
        else{
            res.json(result);
        }
    });
});

router.get('/login', function (req,res) {
    client.query("SELECT * FROM User where kakao_id='" + req.query.id+"';", function (err, result, fields) {
        if (err) {
            res.send(err.stack);

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

// 조인 값 들어옴
router.get('/join', function (req,res) {
    client.query("INSERT INTO User values('" + req.query.id+"' , '"+ req.query.name +"' , '"+ req.query.val+"');", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
            console.log("INSERT INTO user values('" + req.query.id+"' , '"+ req.query.name +"');");
        }
        else {
            res.send('access');
        }
    });
});

//team 만들기
router.get('/create', function (req,res) {
    //console.log(req.session.user_id);
    var random = makeid();
    var a = req.session.user_id;
    client.query("INSERT INTO Team values( '" +random +"' , '"+ req.query.tname +"' , '"+req.query.sname+"', 0, now());" , function (err, result, fields) {
        if (err) {
            res.send(err.stack);
            console.log("INSERT INTO Team values( ' " +random +"' , '"+ req.query.tname +"' , '"+req.query.sname+"', '"+0+"', now());");
            console.log("INSERT INTO UsersTeam values('"+a+"','"+random+"', 1)");
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            // res.send(random);
        }
    });

    client.query("INSERT INTO UsersTeam values('"+a+"','"+random+"',1);", function (err, result, fields) {
        if(err){
            res.send(err.stack);
        }
        else{
            res.send(random);
        }

    })
    //return code
    //방장 정보 추가해주는 함수
});

router.get('/attend', function (req,res) {

    client.query("INSERT INTO UsersTeam values('"+a+"','"+random+"','"+0+"');", function (err, result,fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            res.json(result);
            res.send('access');
        }
    })


});

//과제 만들기
router.get('/create/assign', function (req,res) {
    //console.log(req.session.tm_code);
    client.query("INSERT INTO Assignment(tm_code,as_name,as_content,as_dl) values('"+req.query.tmcode+"','"+req.query.asname+"','"+req.query.ascontent+"',' ');", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            res.send('access');
        }
    });
});

//team list -> 메인페이지 team room 에 유저정보가 없음.
router.get('/get', function (req,res) {
    console.log(req.session.count);
    client.query("select * from UsersTeam u natural join Team t where u.kakao_id = '" + req.query.id+ "';", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.send('access');
            res.json(result);
        }
    });
});

//선택한 팀 -> 팀 세부정보
router.get('/get/team', function (req,res) {
    client.query("SELECT * FROM Team where tm_code='" + req.query.tmcode+ "';", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.send('access');
            res.json(result);
        }
    });
});

//과제 목록
router.get('/get/team/assign', function (req,res) {
    client.query("SELECT * FROM Assignment where tm_code='" + req.query.tm_code+ "';", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.json(result);

        }
    });
});

//선택한 과제 - 이거 유저 과제로 찾아야하나?
router.get('/get/assign', function (req,res) {
    client.query("SELECT * FROM Assignment where assignment_num='" + req.query.as_num+ "';", function (err, result, fields) {
        if (err) {
            res.send('false');
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.send('access');
        }
    });
});

module.exports = router;