const DATE_FORMATER = require('dateformat');
const fs = require('fs');

module.exports = {
    homePage : (req, res) => {
        res.render('home.ejs');
    },
    login : (req, res) => {
        let message = 'Login';
        if (req.method !== 'POST') {
            return res.render('user/login.ejs', {
                message,
                title : 'Node Todo | Login'
            });
        }
        
        let password = req.body.password;
        let email = req.body.email;
        let emailQuery = "SELECT * FROM `user` WHERE email = '" + email + "' and password = '" + password + "'";

        db.query(emailQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            if (result == '' || result.lenght === 0) {
                message = 'Incorrect email or password';
                return res.render('user/login.ejs', {
                    message,
                    title : 'Node Todo | Login'
                });
            } else {
                return res.redirect('/user');
            }
        });
    },

    register : (req, res) => {
        let message = 'Register';
        console.log('hshshs' + req.method); 
        if (req.method !== 'POST') {
            return res.render('user/register.ejs', {
                message,
                title : 'Node Todo | Register'
            });
        }

        let password = req.body.password;
        let email = req.body.email;
        let query = "INSERT INTO `user` (email, password) VALUES ('" +
        email + "', '" + password + "')" ;

        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.redirect('/user');
        });
    },
}
