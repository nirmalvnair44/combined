const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require('express-session');
var validator = require('express-validator');
const morgan = require('morgan');
const {v4:uuidv4} = require('uuid');
dotenv.config({ path: './.env'});

const app = express();

//CREATE A CONNECTION WITH THE DATABASE, IN THIS CASE MYSQL
const db = mysql.createConnection({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database
});

morgan.token('id', function getid(req){
    return req.id
})

let logstream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'})

app.use(assignid);

const publicdir = path.join(__dirname, './public');                        //__dirname gives the path of the current directory of your project
app.use(express.static(publicdir));
//app.use(morgan(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
app.use(morgan(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',{stream:logstream}));
app.use(morgan('dev', {
    skip : function(req,res) {return res.statusCode < 400}
}))
//To parse url encoded bodies
app.use(express.urlencoded({extended:false}));
//app.use(validator());      //
//to parse json bodies
app.use(express.json());
//cookieParser used to set up cookies in our browser
app.use(cookieParser());    //use this to manage cookies, terminate sessions
//app.use(session({secret : }))
app.set('view engine', 'hbs');

function assignid(req,res,next) {
    req.id = uuidv4();
    next();
}

//CONNECT TO THE MYSQL DATABASE
db.connect( (error) => {
    if(error){
        console.log(error);
    }
    else{
        console.log('connected to mysql database');
    }
})

//Define Routes

app.use('/', require('./routes/pages'));    
app.use('/loggedin', require('./routes/pages'));
app.use('/admin', require('./routes/pages'));

app.use('/auth', require('./routes/auth'))

app.listen(3000, () => {
    console.log("server up and running on 3000");
});