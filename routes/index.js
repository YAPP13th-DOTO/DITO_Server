var express = require('express');
var router = express.Router();
var url = require('url');
var querystring = require('querystring');

var mysql = require("mysql");

var client = mysql.createConnection({
    // host : process.env.RDS_HOSTNAME, port: process.env.RDS_PORT,  user:process.env.RDS_USERNAME, password:process.env.RDS_PASSWORD, database:"ebdb", charset :"utf8"
    host : "yappinstance.cgpltqpw2l6i.ap-northeast-2.rds.amazonaws.com"
    , port: 3306,  user:"masterjh", password:"yappdito", database:"ditodb" ,charset :"utf8"

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
            res.send('false');
        }
        else{
            res.json(result);
        }
    });
});

router.get('/test', function(req, res, next) {
    res.render('index');
});
router.get('/login', function (req,res) {
    client.query("SELECT * FROM User where kakao_id='" + req.query.id+"';", function (err, result, fields) {
        if (err) {
            console.log(err.stack);

        }
        else {
            if(result[0] == null){
                client.query("INSERT INTO User values('" + req.query.id+"' , '"+ req.query.name +"' , '"+ req.query.val+"');", function (err, result2, fields) {
                    if (err) {
                        jObj = {};
                        jObj.answer='false';
                        res.send(JSON.stringify(jObj));
                    }
                    else {

                    }
                });
            }

            jObj = {};
            jObj.answer = 'success';
            jObj.kakao_id=req.query.id;
            jObj.user_name=req.query.name;
            jObj.user_pic=req.query.val;

            res.send(JSON.stringify(jObj) );

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
            // res.send('false');
            console.log(err.stack);
            console.log("INSERT INTO UsersTeam values('"+a+"','"+random+"', 1)");
            console.log("쿼리문에 오류가 있습니다.");
        }
        else {
            // res.send(random);
        }
    });

    client.query("INSERT INTO UsersTeam values('"+req.query.id+"','"+random+"',1);", function (err, result, fields) {
        if(err){
            res.send(JSON.stringify("false"));
        }
        else{
            jObj = {};
            jObj.code = random;
            j = JSON.stringify(jObj);
            res.send(j);
        }

    })

});

//team 참여
router.get('/attend', function (req,res) {

    client.query("INSERT INTO UsersTeam values('"+req.query.id+"','"+req.query.code+"',0);", function (err, result,fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log(err.stack);
            console.log(result);
        }
        else {
            // res.json(result);
            jObj = {};
            jObj.answer='access';
            res.send(JSON.stringify(jObj));
        }
    })


});

//과제 만들기
router.post('/create/assign', function (req,res) {
    //console.log(req.session.tm_code);
    var users = req.body.users;
    console.log(req.body.tmcode);
    var a_id ;
    client.query("INSERT INTO Assignment(tm_code,as_name,as_content,as_dl) values('"+req.body.tmcode+"','"+req.body.asname+"','"+req.body.ascontent+"','"+req.body.asdl+"');", function (err, result, fields) {
        if (err) {
            console.log(err.stack);
        }
        else {
        }
    });

    client.query("select last_insert_id();", function (err, result, fields) {
        if(err) {
            console.log(err.stack);

        }
        else{

            var jsonOb = JSON.parse(JSON.stringify(result[0]));
            for(var objVarName in jsonOb) {
                a_id = jsonOb[objVarName];
                console.log(jsonOb[objVarName]);
            }

            for (var i = 0; i < users.length; i++) {
                console.log(a_id);
                client.query("INSERT INTO UsersAss values('" + users[i] + "',0,0," +a_id +",'"+ req.body.tmcode + "',null);", function (err, result, fields) {
                    if (err) {
                        console.log(err.stack);

                    }
                    else {
                        // res.send('access');
                    }
                });
            }
        }

    });

    jObj = {};
    jObj.answer='access';
    res.send(JSON.stringify(jObj));});

//team list -> 메인페이지 team room 에 유저정보가 없음.

function sqlfun (list, i, res) {

    client.query("select user_name, user_pic from UsersTeam natural join User where tm_code='" + list[i].tm_code + "';", function (err, result, fields) {
        if (err) {
            var jObj = {};
            jObj.answer = 'false';
            // res.send(JSON.stringify(jObj));            // console.log(req.session.user_id);
        }
        else {
            // console.log('2');
            // console.log(JSON.stringify(result));
            list[i].users = result;
            // console.log(fields);
            // console.log(list);
            console.log(i);
            console.log(list);
            if(i == list.length -1)
                res.json(list);

        }

    });


}
function first(req,callback) {
    client.query("select * from UsersTeam u natural join Team t where u.kakao_id = '" + req.query.id + "';", function (err, result, fields) {
        var jObj = {};
        if (err) {
            jObj.answer = 'false';
            res.send(JSON.stringify(jObj));            // console.log(req.session.user_id);
        } else {
            var list = [];
            // console.log(JSON.stringify(result));
            j = JSON.parse(JSON.stringify(result));
            for (var r in j) {
                var Obj = {};
                Obj.tm_code = j[r].tm_code;
                Obj.tm_name = j[r].tm_name;
                Obj.sub_name = j[r].sub_name;
                Obj.isdone = j[r].isdone;
                Obj.iscreater = j[r].iscreater;
                Obj.date = j[r].date;
                // console.log('1');
                Obj.users = [];
                // console.log(sqlfun(Obj.tm_code));
                console.log(Obj);
                list.push(Obj);
            }
            console.log(1);
            callback(list);
        }
    });
}
router.get('/get', function (req,res) {
    first(req, function(list){

        for(var i in list) {
             sqlfun( list, i, res);
        }

        });
    console.log("a");
});


//선택한 팀 -> 팀 세부정보
router.get('/get/team', function (req,res) {
    client.query("SELECT * FROM Team where tm_code='" + req.query.tmcode+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));            console.log("쿼리문에 오류가 있습니다.");
        } else {
            // res.send('access');
            res.json(result);
        }
    });
});

//과제 목록
router.get('/get/team/assign', function (req,res) {
    client.query("SELECT * FROM Assignment where tm_code='" + req.query.tmcode+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.json(result);

        }
    });
});

//팀 참여자 목록
router.get('/get/team/list', function (req,res) {
    client.query("SELECT * FROM UsersTeam where tm_code='" + req.query.tmcode+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.json(result);

        }
    });
});

//선택한 과제 - 이거 유저 과제로 찾아야하나?
router.get('/get/assign', function (req,res) {
    client.query("SELECT * FROM Assignment where as_num='" + req.query.as_num+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.json(result);
        }
    });
});

//과제참여자
router.get('/get/assign/list', function (req,res) {
    client.query("SELECT * FROM Assignment where as_num='" + req.query.as_num+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            res.json(result);
        }
    });
});

router.get('/done', function (req,res) {
    client.query("UPDATE Team SET isdone=1 where tm_code='"+req.query.tmcode+"';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            jObj = {};
            jObj.answer='access';
            res.send(JSON.stringify(jObj));
        }
    });
});


router.get('/done/assign', function (req,res) {
    client.query("SELECT * FROM Assignment where as_num='"+req.query.asnum+"';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            client.query("UPDATE Userass SET late=1 where app_time >='"+result[0].asdl+"';", function (err, result, fields) {
                if (err) {
                    jObj = {};
                    jObj.answer='false';
                    res.send(JSON.stringify(jObj));
                    console.log("쿼리문에 오류가 있습니다.");
                } else {
                }
            });
        }
    });
    client.query("UPDATE Userass SET accept=1 where as_num='"+req.query.asnum+"';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
        } else {
            jObj = {};
            jObj.answer='access';
            res.send(JSON.stringify(jObj));
        }
    });
});

module.exports = router;