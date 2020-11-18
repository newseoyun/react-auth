const express = require('express');
const app = express();
const port = 3000;
const config = require('./config/key');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
})  .then(() => console.log('mongoDB connected!'))
    .catch(err => console.log(err));


app.get('/', (req, res) => res.send('hello~~~안뇽?'));

app.post('/register', (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({success: false, err });

        return res.status(200).json({
            success: true
        });
    });
});

app.post('/login', (req, res) => {
    // 유저 검증
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "회원 정보가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호 틀림"
                })
            }

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true,
                        userId: user._id
                    })
            })
        })

    })


    // 있으면 토큰 생성



})


app.listen(port, () => console.log(`server run port ${port}`));
