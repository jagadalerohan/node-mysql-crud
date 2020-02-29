const dateFormatter = require('dateformat');
const fs = require('fs');

// upload the file to the path /public/assets/images directory
const moveUplodedFile = (imageName, uploadedFile) => {
    console.log('Imnage name is ' + imageName);
    uploadedFile.mv(`public/assets/images/${imageName}`, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
    });
}

// Validate the fil mime type
const validateFileType = (uploadedFile) => {
    
    if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
        return true;
    } 

    return false;
}

// Insert or update query with callback funtion
const insertUpdateUser = (query, callback) => {
    db.query(query, (err, result) => {
        callback(err, result);
    });
};

// Get user details by user id 
const getUserById = (id, callback) => {
    let emailQuery = "SELECT * FROM `user` WHERE id = " + id ;
    console.log(emailQuery);
    db.query(emailQuery, (err, result) => {
        return callback(err, result);
    });
}

// Save the image 
const saveImage = (imageName, uploadedFile) => {
    if (!imageName) {
        imageName = result[0].image;
    } else {
        if (validateFileType(uploadedFile)) {
            moveUplodedFile(imageName, uploadedFile);
        } else {
            message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
            return res.render('user/add-user.ejs', {
                message,
                title: "Node todo | Add user"
            });
        }
    }
} 

// Get users details based on condition 
function getUserByCondition(condition, callback) {
    let userQuery = "SELECT * FROM `user` WHERE " + condition;
    db.query(userQuery, (err, result) => {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
}

module.exports = {
    addUser : (req, res) => {
        let message = '';
        if (req.method !== 'POST') {
            return res.render('user/add-user.ejs', {
                title : 'Node Todo | Add user',
                message : '',
                user : ''
            });
        }

        let firstName = req.body.first_name;
        let lastName = req.body.last_name;
        let email = req.body.email;
        let password = req.body.password;
        let id = req.body.id;
        let imageName = '';
        var datetime = dateFormatter(new Date(), 'yyyy-mm-dd');
        let uploadedFile = '';
        if (req.files && req.files.image) {
            let uploadedFile = req.files.image;
            imageName = uploadedFile.name;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            imageName = 'img_' + new Date().valueOf() + '.' + fileExtension;
        }
        
        let status = 2;
        let userCondition = " email = '" + email + "'";

        getUserByCondition(userCondition, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            
            if (result.length > 0 && result[0].id != id) {
                if (!id) {
                    return res.render('user/add-user.ejs', {
                        message : 'Email already exist' ,
                        title : 'Node Todo | Add user',
                        user : []
                    });
                } else {
                    // Get the user details by id and send messgae email already exist
                    getUserById(id, (error, user) => {
                        if (error) {
                            return res.status(500).send(error);
                        }
                        return res.render('user/add-user.ejs', {
                            message : 'Email already exist' ,
                            title : 'Node Todo | Add user',
                            user : user[0]
                        });
                    });
                }
            } else  {
                // If file is uploaded save the uploaded image 
                if (uploadedFile) {
                    saveImage(imageName, uploadedFile);
                }
                // Check is record is already exist tyhen prepare update query
                let insertUpdateQuery = '';
                if (id) {
                    // prepare update query
                    insertUpdateQuery = "UPDATE `user`  SET first_name = '" + firstName  + "', last_name = '" + lastName  + "', email= '" + email  + "', password = '" + password  
                        + "', image = '" + imageName  + "', modified = '" + datetime +"' WHERE id = " + id;
                } else {
                    // prepare insert query
                    insertUpdateQuery = "INSERT INTO `user` (first_name, last_name, email, password, image, status, created) VALUES ('" +
                    firstName + "', '" + lastName + "', '" + email + "', '" + password + "', '" + imageName + "', " + status + ", '" + datetime + "')" ;                
                }
                insertUpdateUser(insertUpdateQuery, (err, response) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
        
                    return res.redirect('/user');
                });
            }
        });
    },
    
    editUser : (req, res) => {
        if (req.params.id) {
            let emailQuery = "SELECT * FROM `user` WHERE id = '" + req.params.id + "'";
            db.query(emailQuery, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }

                console.log(result);
                let user = [];
                let message = '';

                if (result) {
                    user = result[0];
                } else {
                    message = 'Invalid user id, please create new user'
                }

                return res.render('user/add-user.ejs', {
                    title : 'Node todo | Add user',
                    user : user,
                    message : message,
                });
            });
        }
    },

    deletePlayer: (req, res) => {
        let id = req.params.id;
        if (!id) {
            res.render('index.js', {message: 'Please provide proper id'});
        }
        // Query to get the image of user
        let imageQuery = "SELECT image FROM user where id = '" + id + "'";
        // Query to delete the user
        let deleteImage = "DELETE FROM user where id = '" + id + "'";

        db.query(imageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;
            // first delete the image if image is exist
            if (image) {
                fs.unlink(`public/assets/images/${image}`, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                });
            }
            // Delete the user from table 
            db.query(deleteImage, (err, result) => {
                if (err) {
                    res.status(500).send(err);
                }

                res.redirect('/user');
            });
        });
    },
    getUsers : (req, res) => {
        let query = 'SELECT * FROM user';
        db.query(query, (err, result) => {
            if (err) {
                console.log('Exception occure');
                res.redirect('/');
            }
            res.render('user/index.ejs', {
                title : 'Welcome to test app',
                users : result,
                message : '',
                dateFormatter : dateFormatter ,
            });
        });
    },
}