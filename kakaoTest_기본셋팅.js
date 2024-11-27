const express = require('express');
const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
//세션 관리
const session = require('express-session');

const app = express();

//미들웨어 설정
app.use(session({
    secret : '',
    resave : false,
    saveUnintialized : true 
}))

//패스포트 미들웨어
app.use(passport.initialize()); // req.session.passport.user 추가
app.use(passport.session());    // 

const PORT = 8080;
app.listen(PORT, () => console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
