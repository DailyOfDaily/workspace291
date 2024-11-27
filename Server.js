
const dotenv = require('dotenv').config();



let mydb;
// MongoDB + Node.js 접속 코드
const mongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
//npm install objectid 설치
const url = process.env.DB_URL;

mongoClient.connect(url)
.then(client=>{
    console.log('몽고DB 접속 성공');

    mydb = client.db('myboard');
    // // mydb.collection('post').find().toArray().then(function(result){
    // mydb.collection('post').find().toArray().then(result=>{
    //     console.log(result);
    // })

    http.listen(process.env.PORT, function(){   // 기존 app.listen 에서 http.listen 으로 수정(웹소켓 사용을 위해)
        console.log('포트 8000으로 서버 대기중...')
    })
})
.catch(err=>{
    console.log(err);
})


let imagepath = '';

//MySQL과 express는 연관이 없다.
const express = require('express');
const app = express();

const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);

const sha = require('sha256');


//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));  //미들웨어(use를 사용하는 경우 : 정적인 파일을 동적으로 사용할 수 있게 해줌)
//템플릿 엔진 ejs 설정
app.set('view engine', 'ejs');
app.use("/public", express.static('public'));  //미들웨어(use를 사용하는 경우 : 정적인 파일을 동적으로 사용할 수 있게 해줌)


app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/add.js'));
app.use('/', require('./routes/auth.js'));


// 세션 관리
let session = require('express-session');

// 미들웨어 설정
app.use(session({
    secret : '39fd09u29fh0937r90f',
    resave : false,
    saveUninitialized : true
}))

app.get('/session', function(req, res){
    if(isNaN(req.session.milk)){
        req.session.milk = 0;
    }

    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + "원");
})



// //포트 번호 : 0-1024(이미 고정된 번호), 1025-65535
// app.listen(8080, function(){
//     console.log('포트 8080으로 서버 대기중...')
// })


// http://127.0.0.1:8080/book
app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
})

// app.get('/list', function(req, res){
//     //res.send('데이터베이스를 조회합니다.');

//     // conn.query("select * from booklist", function(err, rows, field){
//     //     if(err) throw err;
//     //     console.log(rows);
//     // });

//     mydb.collection('post').find().toArray().then(result=>{
//         console.log(result);
//         res.render('list.ejs', { data : result });
//     })

//     //res.sendFile(__dirname + '/list.html');
    
// })


//홈입니다. (3)
app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    
    if (req.session.user) {
        console.log("세션 유지");
        //res.send('로그인 되었습니다.');
        res.render("index.ejs", { user: req.session.user });
        } else {
            console.log("user : null");
            res.render("index.ejs", { user: null });
        }
})


// app.get('/enter', function(req, res){
//     // res.sendFile(__dirname + '/enter.ejs');
//     res.render('enter.ejs');
// })


app.post('/save', function(req, res){
    console.log('저장완료');
    // 1. 데이터 수신
    console.log(req.body);
    // 2. 데이터 파싱
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);

    // 4. 몽고DB 저장
    mydb.collection('post').insertOne(
        {
            title : req.body.title, 
            content : req.body.content, 
            someDate : req.body.someDate,
            path : imagepath
        }
    )
    .then(result=>{
        console.log(result);
        console.log('데이터 추가 성공');
    });
    
    // res.send('데이터 추가 성공');
    res.redirect('/list');
})

app.post('/delete', function(req, res){
    console.log(req.body._id);

    req.body._id = new ObjId(req.body._id);

    mydb.collection('post').deleteOne(req.body)
    .then(result=>{
        console.log('삭제 완료');
        res.status(200).send();
    }).catch(err=>{
        console.log(err);
        res.status(500).send();
    })
})

app.get('/content/:id', function(req, res){
    console.log(req.params.id);

    req.params.id = new ObjId(req.params.id);
    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then((result)=>{
        console.log(result);
        res.render('content.ejs', {data : result});
    })
})

app.get('/edit/:id', function(req, res){
    console.log(req.params.id);

    // 몽고DB id를 통해서 게시물 조회
    req.params.id = new ObjId(req.params.id);
    mydb.collection('post')
    .findOne({_id : req.params.id})
    .then((result)=>{
        console.log(result);
        res.render('edit.ejs', {data : result});
    })
    
    // result

})


app.post('/edit', function(req, res){
    console.log('수정완료');

    console.log(req.body.id);
    req.body.id = new ObjId(req.body.id);

    // 4. 몽고DB 저장
    mydb.collection('post').updateOne(
        // {식별자}, {수정할 값}
        // {_id : req.body.id}, {$set : {키 : 값}}
        {_id : req.body.id}, 
        {$set : {title : req.body.title,
            content : req.body.content, someDate : req.body.someDate
        }}
    )
    .then(result=>{
        console.log(result);
        console.log('데이터 수정 성공');
    });
    
    // res.send('데이터 추가 성공');
    res.redirect('/list');

});


// 쿠키 사용 - 암호화
let cookieParser = require('cookie-parser');

app.use(cookieParser('qwerABCD'));    // 미들웨어, qwerABCD는 암호화를 위한 의미없는 값

app.get('/cookie', function(req, res){

    let milk = parseInt(req.signedCookies.milk) + 1000;

    if(isNaN(milk)){
        milk = 0;
    }

    res.cookie('milk', milk, {signed : true});  //{maxAge : 1000} 는 1000ms(1초마다 쿠키 리셋)
    res.send('product : ' + milk + '원');
})



// 세션과 연동되므로 login, logout이 세션보다 아래쪽에 위치해야 한다. (순서가 바뀌면 안된다.)
// 로그인 페이지 접속 조회
app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', { user : req.session.user });
    }else{
        res.render('login.ejs');
    }
})

// 로그인 버튼 눌렀을 때 동작
app.post('/login', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);

    mydb.collection('account')
    .findOne({userid : req.body.userid})
    .then((result)=>{
        if(result.userpw == sha(req.body.userpw)){
            req.session.user = req.body;
            console.log('새로운 로그인');
            res.render('index.ejs', { user : req.session.user });
        }else{
            res.render('login.ejs');
        }
        console.log(result);
    }).catch(err=>{
        res.send('아이디가 틀렸습니다.');
    })
})


app.get('/logout', function(req, res){
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', { user : null });
})


// app.get('/signup', function(req, res){
//     console.log('회원가입 페이지');
//     req.session.destroy();
//     res.render('signup.ejs', { user : null });
// })

app.post('/signup', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);
    console.log(req.body.usergroup);
    console.log(req.body.useremail);

    mydb.collection('account').insertOne(
        { 
            userid : req.body.userid, 
            userpw : sha(req.body.userpw), 
            usergroup : req.body.usergroup, 
            useremail : req.body.useremail
        }
    )
    .then(result=>{
        console.log(result);
        console.log('회원가입 성공');
    });
    
    res.redirect('/');
})


let multer = require('multer');

let storage = multer.diskStorage({
    destination : function(req, file, done){
        done(null, './public/image');
    },
    filename : function(req, file, done){
        done(null, file.originalname);
    }
})

let upload = multer({storage : storage});



app.post('/photo', upload.single('picture'), (req, res)=>{  //.single(filename) 또는 .array(fieldname[])
    console.log(req.file.path);
    imagepath = '\\' + req.file.path;
    // imagepath = `\\${req.file.path}`;
})


app.get('/search', function(req, res){
    console.log(req.query.value);
    mydb
    .collection('post')
    .find({title : req.query.value}).toArray()
    .then((result)=>{
        console.log(result);
        res.render("sresult.ejs", {data : result});
    })
})


//웹소켓
app.get('/socket', function(req, res){
    res.render('socket.ejs');
})

io.on('connection', function(socket){
    console.log('클라이언트 접속');

    socket.on('room1-send', function(data){
        io.to('room1').emit('broadcast', data);
    })

    socket.on('joinroom', function(data){
        socket.join('room1');
    })

    // socket.on(작명, 콜백함수);
    socket.on('user-send', function(data){
        console.log(data);

        // io.emit(작명, 메시지);
        // io.to(socket.id).emit('broadcast', data);
        io.emit('broadcast', data);
    })
})