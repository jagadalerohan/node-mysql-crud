const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const path = require('path');
const app = express();
const mysqlConfig = require('./config/mysql');
const {homePage, login, register} = require('./routes/home');
const {addUser, editUser, deletePlayer, getUsers} = require('./routes/user');

const port = process.env.PORT ? process.env.PORT : 3000;

const db = mysql.createConnection({
    host : mysqlConfig.host,
    user : mysqlConfig.user,
    password :  mysqlConfig.password,
    database : mysqlConfig.database
});

db.connect((err) => {
    if (err) {
        throw err;
    }

    console.log('Connected to database');
});

global.db = db;

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

//routes for the app
app.get('/', homePage);
app.all('/login', login);
app.get('/user', getUsers);
app.all('/register', register);
app.all('/user/add', addUser);
app.get('/delete/:id', deletePlayer);
app.get('/edit/:id', editUser);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
