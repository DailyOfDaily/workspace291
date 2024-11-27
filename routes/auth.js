var router = require('express').Router();


let mydb;
// MongoDB + Node.js 접속 코드
const mongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = process.env.DB_URL;
mongoClient.connect(url)
.then(client=>{
    mydb = client.db('myboard');
    })
.catch(err=>{
    console.log(err);
})


router.get('/signup', function(req, res){
    console.log('회원가입 페이지');
    // req.session.destroy();
    res.render('signup.ejs', { user : null });
})





module.exports = router;