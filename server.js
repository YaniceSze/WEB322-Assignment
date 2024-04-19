/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: NGA TSZ SZE Student ID: 136132222 Date: 19/4/2024
*
*  Published URL: https://tricky-jeans-cod.cyclic.app
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path');
const authData = require("./modules/auth-service");
const clientSessions = require('client-sessions');

// Mark "public" folder as "static"
app.use(express.static('public')); 
// Use the template engine
app.set('view engine', 'ejs');
// Middleware to parse URL-encoded data with extended syntax
app.use(express.urlencoded({extended:true}));
// Register "clientSessions" as middleware
app.use(
    clientSessions({
      cookieName: 'session', // this is the object name that will be added to 'req'
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
      duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
      activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
);

// Custom middleware function to ensure that all of your templates will have access to a "session" object
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
  
// Helper middleware function (used to protect a route from unauthorized access)
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
}

// Invoke the initialize function to make sure that the sets array has been successfully built
legoData.initialize()
.then(authData.initialize) // requires authData to be working properly
.then(() => {
    // start the server on the port and output a confirmation to the console
    app.listen(HTTP_PORT, () => console.log(`app listening on: ${HTTP_PORT}`));
})
.catch((err) => {
    console.log(`unable to start server: ${err}`);
});

// This route simply sends back home.ejs
app.get("/",(req,res) => {
    res.render("home");
});

// This route simply sends back about.ejs
app.get("/about",(req,res) => {
    res.render("about");
});

// This route is responsible for responding with all of the Lego sets (array) from our legoData module
app.get("/lego/sets", (req,res) => {

    // If there is a "theme" query parameter present
    const theme = req.query.theme;

    if(theme){
        // If "theme" is present, respond with Lego data for that theme
        legoData.getSetsByTheme(theme)
        .then((data) => {
            res.render("sets",{sets:data});
        })
        .catch((err) => {
            console.error(err);
            res.status(404).render("404", {message: "Unable to find requested sets."});
        });

    } else {
        // If there is not a "theme", respond with all of the unfiltered Lego data
        legoData.getAllSets()
        .then((data) => {
            res.render("sets",{sets:data});
        })
        .catch((err) => {
            console.error(err);
            res.status(404).render("404", {message: "No any sets found."});
        });
    }

});

// This route demonstrates the getSetByNum functionality
app.get("/lego/sets/:setNum", (req,res) => {

    const setNum = req.params.setNum;

    legoData.getSetByNum(setNum)  
    .then((data) => { 
        res.render("set",{set:data});
    })
    .catch((err) => {
        console.error(err);
        res.status(404).render("404", {message: "Unable to find requested set."});
    });  
});

// This route shows the "addSet" form view
app.get("/lego/addSet", ensureLogin, (req,res) => {
    legoData.getAllThemes()
    .then((themeData) => {
        res.render("addSet", { themes: themeData });
    })
    .catch((err) => {
        console.error(err);
        res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`});
    });
});

// This route demonstrates the "addSet" functionality
app.post("/lego/addSet", ensureLogin, (req,res) => {
    const setData = req.body;
    legoData.addSet(setData)
    .then(() => {
        res.redirect("/lego/sets");
    })
    .catch((err) => {
        console.error(err);
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// This route shows the "editSet" form
app.get("/lego/editSet/:num", ensureLogin, (req, res) => {

    const setNum = req.params.num;

    legoData.getSetByNum(setNum)
    .then((setData) => {
        legoData.getAllThemes()
        .then((themeData) => {
            res.render("editSet", { themes: themeData, set: setData });
        })
        .catch((err) => {
            console.error(err);
            res.status(404).render("404", { message: err });
        });
    }).catch((err) => {
        console.error(err);
        res.status(404).render("404", { message: err });
    });
});

// This route demonstrates the "editSet" functionality
app.post("/lego/editSet", ensureLogin, (req,res) => {
    const set_num = req.body.set_num;
    const setData = req.body;

    legoData.editSet(set_num,setData)
    .then(()=> {
        res.redirect("/lego/sets");
    })
    .catch((err) => {
        console.error(err);
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// This route demonstrates the "deleteSet" functionality
app.get("/lego/deleteSet/:num", ensureLogin, (req,res) => {
    const setNum = req.params.num;

    legoData.deleteSet(setNum)
    .then(() => {
        res.redirect("/lego/sets");
    })
    .catch((err) => {
        console.error(err);
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/login', (req, res) => {
    const errorMessage = req.query.error || null;
    res.render('login',{errorMessage});
});

app.get('/register', (req, res) => {
    const successMessage = req.query.success || null;
    const errorMessage = req.query.error || null;
    res.render('register', {successMessage, errorMessage});
});

app.post('/register',(req,res)=> {
    const userData = req.body;
    authData.registerUser(userData)
    .then(() => {
        res.render('register',{successMessage: "User created"});
    })
    .catch((err)=>{
        res.render('register',{successMessage: null, errorMessage: err, userName: req.body.userName});
    });
});

app.post('/login',(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email, // authenticated user's email
            loginHistory: user.loginHistory, // authenticated user's loginHistory
        }; 
        res.redirect('/lego/sets');
    })
    .catch((err)=>{
        res.render('login',{errorMessage: err, userName: req.body.userName});
    });
});

app.get('/logout',(req,res)=>{
    // Reset the session
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req,res)=>{
    res.render('userHistory');
});

// Support for a custom "404 error".  
app.all('*', (req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});



