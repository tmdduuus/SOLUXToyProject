// 서버를 오픈하기 위한 기본 셋팅
// express로 서버를 만들기 위한 기본 문법
const express = require('express'); // 설치한 라이브러리 첨부
const app = express(); // 첨부한 라이브러리 이용하여 새로운 객체 생성
app.use(express.json());
app.use(express.urlencoded({ extended : false}));

// POST 요청으로 서버에 데이터 전송하고 싶으면
// 1. body-parser 필요
// 2. form 데이터의 경우 input들에 name 쓰기
// 3. req.body라고 하면 요청했던 form에 적힌 데이터 수신이 가능하다

// input에 적은 정보 보내기 위한 라이브러리 body-parser
// body-parser는 요청 데이터(body) 해석을 쉽게 도와준다
const bodyParser = require('body-parser'); // const는 변수 하나 생성한다는 뜻
app.use(bodyParser.urlencoded({extended : true}));

// form에서 PUT, DELETE 요청도 할 수 있도록 도와주는 라이브러리
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// EJS : HTML을 쓰기 쉽게 도와주는 템플릿 엔진, 전처리 엔진 라이브러리
// PUG도 EJS와 비슷한 기능을 한다
app.set('view engine', 'ejs');
// 프론트에서 ejs 사용한 경우 주석 풀기

// CSS같이 데이터가 변하지 않는 static file들은 보통 public 폴더 안에 보관
// public > main.css
app.use('/public', express.static('public'));

// MongoDB Database Connect
const MongoClient = require('mongodb').MongoClient;
// connect는 연결해 달라는 명령어
// 연결되면 app.listen 코드 실행
// 따라서 database 접속 완료하면 내부 코드 실행
var db;
MongoClient.connect('mongodb+srv://soluxweb:soluxweb1@soluxweb.nzkvapw.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    if(error){
        return console.log(error)
    }

    db = client.db('soluxweb');

    // listen 함수를 통해 컴퓨터에서 서버 열기 ㄱㄴ
    app.listen(8080, function(){
        console.log('listening on 8080')
    });
});



// / 는 홈페이지
// sendFile(파일 보낼 경로)
// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/index.html');
// });
// app.get('/', function(req, res){
//     res.render('index.ejs');
// });

// 이미지 업로드
let multer = require('multer');
var storage = multer.diskStorage({
    destination : function(req, file, cb){ //어디에 파일을 저장할지
        cb(null, './public/image')
    },
    filename : function(req, file, cb){ // 파일 이름 설정
        cb(null, file.originalname)
    }
}) 

var upload = multer({storage : storage});

app.get('/upload', function(req, res){
    res.render('upload.ejs');
})

app.get('/upload/:profilenum', function(req, res){
    console.log(req.params.profilenum + '으로 수정');
    db.collection('login').findOne({ _id : parseInt(req.body.id) }, function(err, result){
        res.render('upload.ejs', {user : result});
    });
})

app.put('/upload/:profilenum', function(req, res){
    console.log(req.params.profilenum);

    //var setinfo = { email: req.body.email , password: req.body.password, personname: req.body.personname, birth: req.body.birth, gender: req.body.gender, phone1: req.body.phone1, phone2: req.body.phone2, phone3: req.body.phone3, profile : req.params.profilenum}
    db.collection('login').updateOne({ _id : parseInt(req.body._id), email : req.body.email }, { $set : {profile : req.params.profilenum}}, function(err, result){
        // 수정완료시 다른 페이지로 이동
        console.log(req.body.profile);
        console.log('수정완료');
        
    });
    res.redirect('/mypage');
})

app.get('/image/:imageName', function(req, res){
    res.sendFile(__dirname + '/public/image/' + req.params.imageName)
})






// 읽기 기능
// /list로 GET 요청으로 접속하면
// 실제 dB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여준다
// app.get('/list', function(req, res){

//     // DB에 저장된 post라는 collection 안의 모든(/id가 뭐인/제목이 뭐인) 데이터를 꺼내주세요
//     db.collection('post').find().toArray(function(error, result){
//         console.log(result);
//         res.render('list.ejs', { posts : result });
//     });

//     //res.render('list.ejs');
// });
// 읽기 기능
// /list로 GET 요청으로 접속하면
// 실제 dB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여준다
app.get('/board', function(req, res){

    // DB에 저장된 post라는 collection 안의 모든(/id가 뭐인/제목이 뭐인) 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('board.ejs', { posts : result });
    });

    //res.render('list.ejs');
});



// 서버에서 query string 꺼내는 법
app.get('/search', (req, res) => {
    var searching = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: req.query.value,
                    path: 'title' // 제목 날짜 둘 다 찾고 싶으면 ['제목', '날짜']
                }
            }
        }, 
        //{ $sort : {_id : 1 } }, // 검색조건 더 주어 검색 결과 정렬
        //{ $limit : 10 } // 개수 limit 주기
        //{ $project : { title: 1, _id: 0, score: { $meta: "searchScore" } } } // 검색 결과에서 필터 주기
        // 위 조건은 title을 가져오고 id는 가져오지 않고 score 항목을 추가하여 점수를 가져온다
    ]
    console.log(req.query.value); // req에는 요청한 유저의 정보가 다 담겨있다
    // req.query.value는 { object 자료 }에서 데이터를 꺼내는 문법일 뿐이다
//    db.collection('post').find({title:req.query.value}).toArray((err, result) => {
//    db.collection('post').find( { $text: { $search: req.query.value } } ).toArray((err, result) => {
    db.collection('post').aggregate(searching).toArray((err, result) => {
        // 제목이 정확히 req.query.value와 일치하는 것만 찾아준다
        console.log(result);
        // ejs 파일에 데이터 보내기
        res.render('search.ejs', {posts : result});
    });
});



// /detail1로 접속하면 detail1.ejs를 보여준다
// /detail/2로 접속하면 detail2.ejs를 보여준다
// /detail/3으로 접속하면 detail3.ejs를 보여준다
app.get('/view/:idnum', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.idnum)}, function(error, result){
        console.log(result);
        // 어떤이름으로 : 어떤데이터를ejs파일에꽂아주세요
        res.render('view.ejs', { data : result });
    });
});
// 없는 게시물은 어떻게 처리할까
// 글 목록 페이지 /list에서 글 제목 누르면 상세페이지로 이동시키기



// session 방식 로그인 기능 구현
const passport = require('passport'); // passport로 로그인 기능 쉽게 구현
const LocalStrategy = require('passport-local').Strategy; // strategy는 인증 방법
const session = require('express-session');

// 미들웨어 설정
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// sendFile(파일 보낼 경로)
// app.get('/login', function(req, res){
//     res.sendFile(__dirname + '/login.html');
// });
app.get('/login', function(req, res){
    res.render('login.ejs');
});
// local 방식으로 회원 인증, 실패하면 /fail로 이동
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/login'
}), function(req, res){
    // 아이디 비번 맞으면 로그인 성공페이지로 보내줘야함
    // 회원 인증 성공하면 redirect
    res.redirect('/mypage');
});

app.get('/signup', function(req, res){
    res.render('signup.ejs');
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

// 마이페이지 접속, 미들웨어 사용하기
app.get('/mypage', checklogin, function(req, res){
    // 마이페이지 접속 시 요청.user에 사용자의 정보가 담긴다

    console.log(req.user);
    res.render('mypage.ejs', {member : req.user});
});



// 커뮤니티 작성 페이지
// app.get('/write', function(req, res){
//     res.sendFile(__dirname + '/write.html');
// });
app.get('/write', checklogin, function(req, res){
    res.render('write.ejs');
});



//1. post 함수에서 누가 로그인하면 local 방식으로 아이디/비번 인증
//2. passport.use 함수가 인증하는 코드이다
//3. 인증성공하면 passport.serializeUser 함수에서 세션 + 쿠키를 만들어줌

// passport로 로그인 기능 쉽게 구현, 아이디/비번 인증
passport.use(new LocalStrategy({
    // 유저가 입력한 아이디/비번 항목이 무엇인지 정의 (name 속성)
    usernameField: 'email',
    passwordField: 'password',
    // 로그인 후 세션을 저장할 것인지
    session: true,
    // 아이디/비번 말고도 다른 정보 검증시
    passReqToCallback: false,
}, function(inputemail, inputpassword, done){
    // 사용자의 아이디, 비번을 검증하는 부분
    // 입력한 아이디와 비번
    console.log(inputemail, inputpassword);
    // DB에 입력한 아이디가 있는지 찾기
    db.collection('login').findOne({email : inputemail}, function(err, result){
        // DB 연결 불가 등의 상황에서 실행
        if (err) return done(err)
        // DB에 아이디가 없으면 아래를 실행
        // 아이디/비번 안맞으면 false 넣어야 함
        if (!result) return done(null, false, {message : '존재하지 않는 아이디'})
        // DB에 아이디가 있으면, 입력한 비번과 결과.pw 비교
        if (inputpassword == result.password){
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
    done(null, user.email);
    // 세션 데이터를 만들고 세션의 id 정보를 쿠키로 보냄
});
// 해당 세션 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
// 로그인한 유저의 세션 아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(useremail, done){
    // DB에서 위에 있는 user.id로 유저를 찾은 뒤에
    // 유저 정보를 result 안에 넣는다
    // 여기에서의 userid는 위의 user.id, 즉 test와 같다
    db.collection('login').findOne({email : useremail}, function(err, result){
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

    //var tosave = { email : req.body.email, password : req.body.password, personname : req.body.personname, birth : req.body.birth, gender : req.body.gender, phone1 : req.body.phone1, phone2 : req.body.phone2, phone3 : req.body.phone3 }
    var tosave = { email : req.body.email, password : req.body.password, personname : req.body.personname, birth : req.body.birth, gender : req.body.gender, phone1 : req.body.phone1, phone2 : req.body.phone2, phone3 : req.body.phone3, profile : req.body.profile}

    db.collection('login').insertOne( tosave, function(err, result){
        res.redirect('/login');
    });
});



app.get('/signupedit/:idemail', function(req, res){
    db.collection('login').findOne({ _id : req.user._id, email : req.params.idemail }, function(error, result){
        console.log(result);
        // 어떤이름으로 : 어떤데이터를ejs파일에꽂아주세요
        res.render('signupedit.ejs', { data : result });
    });
});

// 폼 전송시 _id : ?? 정보도 함께 보내기
// 1. 몰래 input을 만들고 value에 정보를 넣음
// 2. name 쓰기
// 3. 요청.body.인풋의 name으로 꺼내기
app.put('/signupedit', function(req, res){
    // 폼에 담긴 제목 데이터, 날짜 데이터를 가지고
    // db.collection에다가 업데이트

    var setinfo = { email: req.body.email , password: req.body.password, personname: req.body.personname, birth: req.body.birth, gender: req.body.gender, phone1: req.body.phone1, phone2: req.body.phone2, phone3: req.body.phone3 }

    db.collection('login').updateOne({ _id : req.user._id, email : req.user.email }, { $set : setinfo}, function(err, result){
        // 수정완료시 다른 페이지로 이동
        console.log('수정완료');
        res.redirect('/login');
    });
});



// 쓰기 기능
// post 요청으로 서버에 데이터 전송하고 싶으면 body-parser 필요
// form 데이터의 경우 input들에 name 쓰기
// req.body라고 하면 요청했던 form에 적힌 데이터 수신 가능
// // /add로 post 요청하면 (폼 전송하면)
// DB의 총게시물개수(totalpostnum) 데이터를 가져오고
// _id : totalpostnum + 1하여
// 새로운 데이터를 post 콜렉션에 저장하는 코드
app.post('/addcommu', function(req, res){
    //res.send('전송완료');
    //console.log(req.body)
    console.log(req.body.title)
    console.log(req.body.writingcommu)

    // 어떤 사람이 /add 라는 경로로 post 요청을 하면,
    // 데이터 2개(날짜, 제목)을 보내주는데,
    // 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장
    // { 제목 : '어쩌구', 날짜 : '어쩌구' }
    db.collection('counter').findOne({name : '게시물 개수'}, function(error, result){
        // result는 findOne으로 가져온 데이터
        console.log(result.totalPost);
        // result.totalPost를 총게시물개수 변수인 totalpostnum에 저장
        var totalpostnum = result.totalPost;

        var tosave = { _id : totalpostnum + 1, editor : req.user._id, email : req.user.email, nickname : req.body.nickname, writtendate : req.body.writtendate, title : req.body.title, writebody : req.body.writebody }

        // 글을 발행해주는 기능
        db.collection('post').insertOne(tosave, function(error, result){
            // _id : 총 게시물 개수 + 1
            console.log('저장완료');

            // counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야 한다
            db.collection('counter').updateOne({name : '게시물 개수'}, { $inc : {totalPost : 1} }, function(error, result){
                if(error){
                    return console.log(error)
                }
            });

            res.redirect('/board');
        });
    });
});



// 지원서 작성 페이지
app.get('/apply', checklogin, function(req, res){
    res.render('apply.ejs');
});

app.post('/addappli', function(req, res){
    //res.send('전송완료');

    var saveappli = { _id : req.user._id, email : req.user.email, application1 : req.body.application1, application2 : req.body.application2, application3 : req.body.application3, application4 : req.body.application4 }

    db.collection('application').insertOne(saveappli, function(error, result){
        console.log('저장완료');
        res.redirect('/mypage');

        if (error){
            return console.log(error)
        }
    });
});



// app.get('/myapplication/:identify', checklogin, function(req, res){

//     db.collection('application').findOne({ _id : req.user._id, email : req.params.identify }, function(error, result){
//         console.log(result);
//         // 어떤이름으로 : 어떤데이터를ejs파일에꽂아주세요
//         res.render('myapplication.ejs', { data : result });
//     });
// });
// 없는 게시물은 어떻게 처리할까
// 글 목록 페이지 /list에서 글 제목 누르면 상세페이지로 이동시키기



app.get('/viewappli/:identify', checklogin, function(req, res){
    db.collection('application').findOne({ _id : req.user._id, email : req.params.identify }, function(error, result){
        console.log(result);
        // 어떤이름으로 : 어떤데이터를ejs파일에꽂아주세요
        res.render('viewappli.ejs', { data : result });
    });
});



// 폼 전송시 _id : ?? 정보도 함께 보내기
// 1. 몰래 input을 만들고 value에 정보를 넣음
// 2. name 쓰기
// 3. 요청.body.인풋의 name으로 꺼내기
// app.put('/editappli', function(req, res){
//     // 폼에 담긴 제목 데이터, 날짜 데이터를 가지고
//     // db.collection에다가 업데이트

//     var changeappli = { application1 : req.body.application1, application2 : req.body.application2, application3 : req.body.application3, application4 : req.body.application4 }

//     db.collection('application').updateOne({ _id : req.user._id, email : req.user.email }, { $set : changeappli }, function(err, result){
//         // 수정완료시 다른 페이지로 이동
//         console.log('수정완료');
//         res.redirect('/mypage');
//     });
// });

app.get('/edit/:id', checklogin, function(req, res){

    //req.body._id = parseInt(req.body._id) //문자형 '1'을 정수 1로 변환

    // _id와 작성자가 일치하는 게시물을 찾는다
    var compare = { _id : parseInt(req.params.id), editor : req.user._id };

    //db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
    db.collection('post').findOne(compare, function(err, result){
        console.log(result)
        if(result){
            res.render('edit.ejs', {post : result});
        }
        else{
            res.redirect('/board');
        }
            
        //res.render('edit.ejs', 파라미터 중 :id 번 게시물의 제목/날짜);
    });
});

// 폼 전송시 _id : ?? 정보도 함께 보내기
// 1. 몰래 input을 만들고 value에 정보를 넣음
// 2. name 쓰기
// 3. 요청.body.인풋의 name으로 꺼내기
app.put('/edit', function(req, res){
    // 폼에 담긴 제목 데이터, 날짜 데이터를 가지고
    // db.collection에다가 업데이트

    var editting = { nickname : req.body.nickname, writtendate : req.body.writtendate, title : req.body.title, writebody : req.body.writebody }

    db.collection('post').updateOne({ _id : parseInt(req.body.id), editor : req.user._id, email : req.user.email }, { $set : editting }, function(err, result){
        // 수정완료시 다른 페이지로 이동
        console.log({ _id : parseInt(req.body.id), editor : req.user._id, email : req.user.email });
        console.log(editting);
        res.redirect('/board');
    });
});



// 서버에서는 /delete 경로로 DELETE 요청을 처리하는 코드를 작성
app.delete('/delete', function(req, res){
    console.log('삭제 요청');
    console.log(req.body);
    //req.body에 담긴 게시물 번호에 따라 DB에서 게시물을 삭제
    req.body._id = parseInt(req.body._id) //문자형 '1'을 정수 1로 변환
    
    // _id와 작성자가 일치하는 게시물을 찾아서 지워준다
    var deletedata = { _id : req.body._id, editor : req.user._id };
    
    //req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(deletedata, function(error, result){
        console.log('삭제 완료');

        //응답코드 200을 보내고 메시지를 보내주세요
        // 200이나 2XX를 보내면 요청 성공
        // 400이나 4XX를 보내면 고객 잘못으로 요청 실패
        // 500이나 5XX를 보내면 서버 문제로 요청 실패
        res.status(200).send({ message : '성공' });
        //res.status(400).send({ message : '실패' });
    });

});
