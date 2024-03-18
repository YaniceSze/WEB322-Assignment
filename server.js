/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: NGA TSZ SZE Student ID: 136132222 Date: 18/3/2024
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path');

// Mark "public" folder as "static"
app.use(express.static('public')); 
// Use the template engine
app.set('view engine', 'ejs');

// Invoke the initialize function to make sure that the sets array has been successfully built
legoData.initialize().then(() => {
    // start the server on the port and output a confirmation to the console
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
})
.catch((err) => {
    console.log(err)
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


// Support for a custom "404 error".  
app.all('*', (req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});



