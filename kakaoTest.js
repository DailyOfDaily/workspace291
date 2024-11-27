//카카오계정테스트입니다.
//이번에는 GIT 차례
//다시 진짜최종 차례
//진짜최종이 수정한다요.
//GIT이 수정한다요


const express = require('express');
const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
//세션 관리
const session = require('express-session');

const app = express();

//미들웨어 설정
app.use(session({
    secret : '39fd09u29fh0937r90f',
    resave : false,
    saveUnintialized : true 
}))

//패스포트 미들웨어
app.use(passport.initialize()); // req.session.passport.user 추가
app.use(passport.session());    // 

const users = [];


passport.use(new kakaoStrategy(
    {
        clientID : 'a191bff31af4a5bde8b2e8191950ff41',
        callbackURL : '/auth/kakao/callback'
    },
    function(accessToken, refreshToken, profile, done){
        console.log(profile);

        var authId = 'Kakao' + profile.id;
        let user = users.find(user => user.authId === authId);

        if(!user){
            user = {
                authId : authId,
                displayName : profile.username || profile.displayName
            };
            users.push(user);
        }
        return done(null, user);
    }
))


passport.serializeUser(function(user, done){
    console.log("serializeUser");
    console.log(user);
    done(null, user.authId);
})


passport.deserializeUser(function(authId, done){
    console.log("deserializeUser");
    const user = users.find(user => user.authId === authId);
    done(null, user || false);
})


app.get('/', (req, res)=>{
    res.send(`
        <h1>카카오 로그인</h1>
        <a href = "/auth/kakao">로그인</a>
    `);
})


app.get('/auth/kakao', passport.authenticate('kakao'));

app.get('/auth/kakao/callback', passport.authenticate('kakao', {
    successRedirect : '/profile',
    failureRedirect : '/'
}));

app.get('/profile', (req, res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/');
    }
    res.send(`
        <h1>이름 : ${req.user.displayName}</h1>
        <a href = "/logout">로그아웃</a>
        `)
})


const PORT = 8080;
app.listen(PORT, () => console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
