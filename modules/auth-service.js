// Require moogoose
const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Define new "userSchema"
const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String,
  }]
});

let User; // to be defined on new connection (see initialize)

// Initialize function (connect to MongoDB)
function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB);
    
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
}

// Function to perform data validation on registration
function registerUser(userData) {
    return new Promise((resolve,reject) => {
        // Return the error message when there is difference between the value of the .password property and the .password2 property
        if(userData.password !== userData.password2) {
            reject("Passwords do not match");
        }
        else
        {
            // Hash the password
            bcrypt.hash(userData.password,10)
            .then((hash) => {
                // Replace the userData password with the hashed password
                userData.password = hash;

                let newUser = new User(userData);

                // Save the data into users collection
                newUser.save()
                .then(()=>{
                    resolve();
                })
                .catch((err)=>{
                    if(err.code === 11000){
                        reject("User Name already taken");
                    }
                    else
                    {
                        reject(`There was an error creating the user: ${err}`);
                    }
                });
            })
            .catch((err) => {
                reject("There was an error encrypting the password");
            });
        }
    });
}

// Function to check if user exists in database
function checkUser(userData) {
    return new Promise((resolve,reject)=>{
        User.find({ userName: userData.userName })
        .exec()
        .then((users)=>{
            if(users.length === 0){
                // Couldn't find the user in the database
                reject(`Unable to find user: ${userData.userName}`);
            }
            else
            {
                // Compare the entered password with the hashed version password from the database
                bcrypt.compare(userData.password, users[0].password)
                .then((result)=>{

                    if(result === false){
                        // The password doesn't match
                        reject(`Incorrect Password for user: ${userData.userName}`);
                    }
                    else
                    {
                        // Pop the last element from the array if there are 8 login history items
                        if(users[0].loginHistory.length === 8){
                            users[0].loginHistory.pop();
                        }
                        // Add a new entry to the front of the array 
                        users[0].loginHistory.unshift({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        
                        // Update loginHistory of the user
                        User.updateOne({userName: users[0].userName}, {$set: {loginHistory: users[0].loginHistory}})
                        .exec()
                        .then(()=>{
                            resolve(users[0]);
                        })
                        .catch((err)=>{
                            reject(`There was an error verifying the user: ${err}`);
                        });
                    }
                })
                .catch((err)=>{
                    reject(`There was an error verifying the user: ${err}`);
                });
            }
        })
        .catch((err)=>{
            // Couldn't find the user in the database
            reject(`Unable to find user: ${userData.userName}`);
        });
    });
}

module.exports = {initialize, registerUser, checkUser};