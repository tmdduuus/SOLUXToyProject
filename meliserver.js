// 서버를 오픈하기 위한 기본 셋팅
// express로 서버를 만들기 위한 기본 문법
const express = require('express'); // 설치한 라이브러리 첨부
const app = express(); // 첨부한 라이브러리 이용하여 새로운 객체 생성

// input에 적은 정보 보내기 위한 라이브러리 body-parser
// body-parser는 요청 데이터(body) 해석을 쉽게 도와준다
const bodyParser = require('body-parser'); // const는 변수 하나 생성한다는 뜻
app.use(bodyParser.urlencoded({extended : true}));

// EJS : HTML을 쓰기 쉽게 도와주는 템플릿 엔진, 전처리 엔진 라이브러리
// PUG도 EJS와 비슷한 기능을 한다
// app.set('view engine', 'ejs');
// 프론트에서 ejs 사용한 경우 주석 풀기

// MongoDB Database Connect
const MongoClient = require('mongodb').MongoClient;
// connect는 연결해 달라는 명령어
// 연결되면 app.listen 코드 실행
// 따라서 database 접속 완료하면 내부 코드 실행
var db;
MongoClient.connect('mongodb+srv://meli:soluxtoyprojectbackend@solux.sunzesk.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if(error){
        return console.log(error)
    }

    db = client.db('solux');

    // listen 함수를 통해 컴퓨터에서 서버 열기 ㄱㄴ
    app.listen(8080, function(){
        console.log('listening on 8080')
    });
});



// / 는 홈페이지
// sendFile(파일 보낼 경로)
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//app.get('/login', function(req, res){
//    res.send('로그인 되었습니다');
//});



// 이 코드 버릴 수도? 그렇게 되면 login.html 필요 ㄴㄴ
// app.get('/login', function(req, res){
//     res.sendFile(__dirname + '/login.html');
// });

// // post 요청으로 서버에 데이터 전송하고 싶으면 body-parser 필요
// // form 데이터의 경우 input들에 name 쓰기
// // req.body라고 하면 요청했던 form에 적힌 데이터 수신 가능
// app.post('/loginsuccess', function(req, res){
//     res.send('전송 완료');
//     console.log(req.body.loginid); // 로그인
//     console.log(req.body.pw); // 패스워드

//     // 어떤 사람이 /loginsuccess 라는 경로로 post 요청을 하면,
//     // 데이터 2개(날짜, 제목)을 보내주는데,
//     // 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장
//     // { 제목 : '어쩌구', 날짜 : '어쩌구' }
//     db.collection('login').insertOne({ loginid : req.body.loginid, pw : req.body.pw }, function(error, result){
//         console.log('저장완료');
//     });

// });



// // 프론트에서 ejs 사용한 경우 주석 풀어서 수정하기
// app.get('/list', function(req, res){
//     res.render('list.ejs');
// });



// session 방식 로그인 기능 구현
const passport = require('passport'); // passport로 로그인 기능 쉽게 구현
const LocalStrategy = require('passport-local').Strategy; // strategy는 인증 방법
const session = require('express-session');

// 미들웨어 설정
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
    res.render('login.ejs');
});
// local 방식으로 회원 인증, 실패하면 /fail로 이동
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(req, res){
    // 아이디 비번 맞으면 로그인 성공페이지로 보내줘야함
    // 회원 인증 성공하면 redirect
    res.redirect('/');
});



// 마이페이지 접속, 미들웨어 사용하기
app.get('/mypage', checklogin, function(req, res){
    // 마이페이지 접속 시 요청.user에 사용자의 정보가 담긴다
    console.log(req.user);
    res.render('mypage.ejs', {member : req.user});
});
// 로그인 했는지 판단하는 함수, 미들웨어 만들기
// 마이페이지 접속 전 실행할 미들웨어
function checklogin(req, res, next){
    // 로그인 후 세션이 있으면 요청.user가 항상 있다
    if (req.user){
        // 요청.user가 있으면 next() (통과)
        next();
    } else{
        // 요청.user가 없으면 경고메세지 응답
        res.send('로그인되지 않았습니다.');
    }
}



//1. post 함수에서 누가 로그인하면 local 방식으로 아이디/비번 인증
//2. passport.use 함수가 인증하는 코드이다
//3. 인증성공하면 passport.serializeUser 함수에서 세션 + 쿠키를 만들어줌

// passport로 로그인 기능 쉽게 구현, 아이디/비번 인증
passport.use(new LocalStrategy({
    // 유저가 입력한 아이디/비번 항목이 무엇인지 정의 (name 속성)
    usernameField: 'id',
    passwordField: 'pw',
    // 로그인 후 세션을 저장할 것인지
    session: true,
    // 아이디/비번 말고도 다른 정보 검증시
    passReqToCallback: false,
}, function(inputid, inputpw, done){
    // 사용자의 아이디, 비번을 검증하는 부분
    // 입력한 아이디와 비번
    console.log(inputid, inputpw);
    // DB에 입력한 아이디가 있는지 찾기
    db.collection('login').findOne({id : inputid}, function(err, result){
        // DB 연결 불가 등의 상황에서 실행
        if (err) return done(err)
        // DB에 아이디가 없으면 아래를 실행
        // 아이디/비번 안맞으면 false 넣어야 함
        if (!result) return done(null, false, {message : '존재하지 않는 아이디'})
        // DB에 아이디가 있으면, 입력한 비번과 결과.pw 비교
        if (inputpw == result.pw){
            return done(null, result)
        } else{
            return done(null, false, {message : '비밀번호가 틀렸습니다'})
        }
    });
}));

// 아이디/비번 맞으면 세션을 하나 생성해준다
// 세션 만들기
// id를 이용해서 세션을 저장시키는 코드 (로그인 성공시 발동)
// 아이디/비번 검증 성공시 result 값이 user로 보내진다
passport.serializeUser(function(user, done){
    // id를 이용해서 세션을 저장시키는 코드 (로그인 성공시 발동)
    // 세션에는 user.id만 저장된다
    done(null, user.id);
    // 세션 데이터를 만들고 세션의 id 정보를 쿠키로 보냄
});
// 해당 세션 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
// 로그인한 유저의 세션 아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(userid, done){
    // DB에서 위에 있는 user.id로 유저를 찾은 뒤에
    // 유저 정보를 result 안에 넣는다
    // 여기에서의 userid는 위의 user.id, 즉 test와 같다
    db.collection('login').findOne({id : userid}, function(err, result){
        done(null, result);
        // result에는 {id : test, pw : test}가 들어간다
        // 따라서 마이페이지 접속 시 DB에서 { id : 어쩌구 }인 것을 찾아서
        // 해당 결과를 보내준다
    });
});

// 회원 가입 기능
// /register로 POST 요청, 서버는 이를 DB에 저장하면 가입기능 끝
// 유저가 입력한 id pw를 DB에 저장
app.post('/register', function(req, res){
    db.collection('login').insertOne( {id : req.body.id, pw : req.body.pw }, function(err, result){
        res.redirect('/');
    } );
});
