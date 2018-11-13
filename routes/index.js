var express = require('express');
var router = express.Router();
var url = require('url');
var querystring = require('querystring');
var mysql = require("mysql");
var FCM = require('fcm-push');
var serverKey = 'AAAAHkGjBGY:APA91bH0__dFGbQjPxgXn2pegFmzfWuJL3nGS7PB9jJwHOqUKPgUnPjufDidTjQoWfEzLAsCGXp9nGGRdjKZct08lN3-VV705rBy-K0BwDVJIbftOB0SfLvMDjnRt5PtUm3U1dzkToBF';
var fcm = new FCM(serverKey);

require('date-utils');

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
router.get('/delete', function (req,res,next)
{
   client.query("SET SQL_SAFE_UPDATES = 0; ",function (err, result) {
       if(err){
           console.log(err.stack)
       }else{
           client.query("delete from UsersAss;",function (err, result) {
               if(err){

               }
               else{
                   client.query("delete from Assignment;", function (err, result){
                       if(err){

                       }
                       else{
                           client.query("delete from UsersTeam;", function (err, result){
                               if(err){

                               }
                               else{
                                   client.query("delete from Team; ", function (err, result) {

                                       if(err){

                                       }
                                       else{
                                           client.query("delete from User;", function(err, result){
                                               if(err){
                                                   res.send("false");
                                               }
                                               else{
                                                   res.send("success");
                                               }
                                           })
                                       }
                                   })
                               }
                           })
                       }
                   } )

               }
           })
       }

   })
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
client.query("select * from UsersTeam where kakao_id='"+req.query.id+"' and tm_code='"+req.query.code+"';", function (err, result,fields) {
    if(err){

    }
    else {
        console.log(1);
        if(result.length ==0) {
            client.query("INSERT INTO UsersTeam values('" + req.query.id + "','" + req.query.code + "',0);", function (err, result, fields) {
                if (err) {
                    jObj = {};
                    jObj.answer = 'false';
                    res.send(JSON.stringify(jObj));
                    console.log(err.stack);
                    console.log(result);
                }
                else {
                    // res.json(result);
                    jObj = {};
                    jObj.answer = 'access';
                    res.send(JSON.stringify(jObj));
                }
            });
        }
        else{
            jObj = {};
            jObj.answer = 'already';
            res.send(JSON.stringify(jObj));
        }
    }
});


});

function lastInsert(callback){

}
//과제 만들기
router.post('/create/assign', function (req,res) {
    //console.log(req.session.tm_code);
    var users = req.body.users;
    console.log(req.body.users+ req.body.users.length);
    console.log(req.body.tmcode);
    var a_id ;
    client.query("INSERT INTO Assignment(tm_code,as_name,as_content,as_dl) values('"+req.body.tmcode+"','"+req.body.asname+"','"+req.body.ascontent+"','"+req.body.asdl+"');", function (err, result, fields) {
        if (err) {
            console.log(err.stack);
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
        }
        else {
            client.query("select last_insert_id();", function (err, result, fields) {
                if(err) {
                    console.log(err.stack);

                }
                else {
                    var jsonOb = JSON.parse(JSON.stringify(result[0]));
                    for (var objVarName in jsonOb) {
                        a_id = jsonOb[objVarName];
                        console.log(jsonOb[objVarName]);
                        console.log(Object.keys(users).length);

                    }

                    var lan =Object.keys(users).length;

                    var string = "";
                    if(!Array.isArray(users)) {

                        string += "('" + users + "',0,0," + a_id + ",'" + req.body.tmcode + "',0)"
                        console.log("isarray");
                    }

                    else {
                        for (var i = 0; i < lan; i++) {

                            string += "('" + users[i] + "',0,0," + a_id + ",'" + req.body.tmcode + "',0)";
                            if (i + 1 != lan)
                                string += ",";
                            console.log(users[i]);
                        }
                    }
                    console.log(a_id);
                    client.query("INSERT INTO UsersAss values"+string+";", function (err, result, fields) {
                        if (err) {
                            console.log(err.stack);

                            jObj = {};
                            jObj.answer = 'false';
                            res.send(JSON.stringify(jObj));
                            return false;

                        }
                        else {
                                jObj = {};
                                jObj.answer = 'access';
                                res.send(JSON.stringify(jObj));
                        }
                    });
                }
            });
        }
    });



});

//team list -> 메인페이지 team room 에 유저정보가 없음.

function sqlfun (list, i, res) {

    client.query("select * from UsersTeam natural join User where tm_code='" + list[i].tm_code + "';", function (err, result, fields) {
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
    client.query("SELECT * FROM Team natural join UsersTeam where tm_code='" + req.query.tmcode+ "' and kakao_id = '"+ req.query.id+"';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));            console.log("쿼리문에 오류가 있습니다.");
        } else {
            // res.send('access');
            j = result[0];
            var obj = {};
            console.log(j);
            obj.tm_code = j.tm_code;
            obj.kakao_id = j.kakao_id;
            obj.iscreater = j.iscreater;
            obj.tm_name = j.tm_name;
            obj.sub_name = j.sub_name;
            obj.isdone = j.isdone;
            obj.date = j.date;
            console.log(j);

            client.query("SELECT * FROM User natural join UsersTeam where tm_code='" + req.query.tmcode+"';", function (err, result, fields) {
                if(err){
                    jObj = {};
                    jObj.answer='false';
                    res.send(JSON.stringify(jObj));            console.log("쿼리문에 오류가 있습니다.");

                }else {
                    console.log(obj);
                    obj.users = result;
                    obj.answer = 'access';
                    res.send(JSON.stringify(obj));
                }


            })
        }
    });
});

function ass(req, callback){
    client.query("SELECT * FROM Assignment where tm_code='" + req.query.tmcode+ "';", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {
            Obj = {};
            Obj.answer = 'access';
            Obj.list = [];
            for (i = 0; i < Object.keys(result).length; i++) {
                jObj = {};
                jObj.tm_code = result[i].tm_code;
                jObj.as_content = result[i].as_content;
                jObj.as_name = result[i].as_name;
                jObj.as_num = result[i].as_num;
                jObj.as_dl = result[i].as_dl;
                Obj.list.push(jObj);
            }
            callback(Obj);
        }
    });
}

function as_user(Obj, i, res){

    client.query("SELECT * FROM UsersAss natural join User where as_num=" + Obj.list[i].as_num+ ";", function (err, result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='false';
            res.send(JSON.stringify(jObj));
            console.log("쿼리문에 오류가 있습니다.");
        } else {

            /*Obj = {};
            Obj.users = [];
            Obj.answer = 'access';
            for(i = 0; i < Object.keys(result).length; i++){
                jObj = {};
                jObj.kakao_id = result[i].kakao_id;
                jObj.late = result[i].late;
                jObj.accept = result[i].accept;
                jObj.as_num = result[i].as_num;
                jObj.team_code = result[i].team_code;
                jObj.req = result[i].req;
                jObj.user_name = result[i].user_name;
                jObj.user_pic = result[i].user_pic;
                console.log(jObj);
                Obj.users.push(jObj);
            }*/
            Obj.list[i].users = result;
            if(i == Obj.list.length -1)
                res.send(JSON.stringify(Obj));
        }
    });
}
//과제 목록
router.get('/get/team/assign', function (req,res) {

    ass(req, function(Obj){
        for(var i in Obj.list) {
            as_user( Obj, i, res);
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
            j = result[0];

            jObj = {};
            jObj.tm_code = j.tm_code;
            jObj.as_name = j.as_name;
            jObj.as_content = j.as_content;
            jObj.as_num = j.as_num;
            jObj.as_dl = j.as_dl;
            jObj.answer = 'access';
            var now = new Date();
            var deadline = new Date(j.as_dl);
            var n = now.getTime()/(24*60*60*1000);
            var d = deadline.getTime()/86400000;

            console.log(n);
            console.log(d);

            console.log(Math.floor(d-n));
            console.log(now.getHours()+","+now.getMinutes()+","+now.getSeconds());
            if(Math.floor(d-n) == 0){
                var gap = Math.round((deadline.getTime()-now.getTime())/1000);
                var D = Math.floor(gap / 86400);
                var H = Math.floor((gap - D * 86400) / 3600 % 3600);
                var M = Math.floor((gap - H * 3600) / 60 % 60);
                var S = Math.floor((gap - M * 60) % 60);
                jObj.dday=H+":"+M+":"+S;
                  }
            else if(Math.floor(d-n) < 0){
                jObj.dday = -1;
            }
            else
                jObj.dday =Math.floor(d-n);

            console.log(jObj);
            res.send(JSON.stringify(jObj));



        }
    });
});

//과제참여자
// router.get('/get/assign/list', function (req,res) {

// });

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


router.get('/get/user', function(req,res) {
    client.query("SELECT * FROM User where kakao_id='" +req.query.id+"';", function (err,result, fields) {
        if (err) {
            jObj = {};
            jObj.answer='error';
            res.send(JSON.stringify(jObj)); // 잘못된 문자열입력했을때 아니면 걍 쿼리오류
        }
        else {
            if(result[0] == null) {
                jObj = {};
                jObj.answer='false';
                res.send(JSON.stringify(jObj)); // false
            }
            else {
                r = JSON.parse(JSON.stringify(result[0]));
                jObj = {};
                jObj.answer = 'access';
                jObj.kakao_id=r.kakao_id;
                jObj.user_name=r.user_name;
                jObj.user_pic=r.user_pic;

                res.send(JSON.stringify(jObj) );
            }
        }
    });
});

router.get('/push/req',function (req,res) {
   var message = {
       to: req.query.token,
       data: {
           title: '과제승인요청',
           content: req.query.name+'님의 과제 승인 요청이 왔습니다.'
       }

   };
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    client.query("UPDATE UsersAss SET req=1 where kakao_id='"+req.query.id+"';", function (err, result, fields) {
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

router.get('/push/answer',function (req,res) {

    var message = {
        to: req.query.token,
        data: {
            title: '승인요청 확인',
            content: '승인요청이 확인되었습니다.'
        }
    };
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    client.query("UPDATE UsersAss SET req=1 where kakao_id='"+req.query.id+"';", function (err, result, fields) {
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