/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: NGA TSZ SZE Student ID: 136132222 Date: 18/2/2024
*
*  Published URL: 
*
********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path');

// Invoke the initialize function to make sure that the sets array has been successfully built
legoData.initialize().then(() => {
    // start the server on the port and output a confirmation to the console
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
})
.catch((err) => {
    console.log(err)
});

// Mark "public" folder as "static"
app.use(express.static('public')); 

// This route simply sends back home.html
app.get("/",(req,res) => {
    try {
        const filePath = path.join(__dirname, "/views/home.html"); //'views', 'home.html'
        res.sendFile(filePath);
    } catch (err) {
        console.error(err);
        res.status(404).send('Home 404 Not Found!')
    }
});

// This route simply sends back about.html
app.get("/about",(req,res) => {
    try {
        const filePath = path.join(__dirname,"/views/about.html");
        res.sendFile(filePath);
    } catch (err) {
        console.error(err);
        res.status(404).send('about page Not Found!')
    }
});

// This route is responsible for responding with all of the Lego sets (array) from our legoData module
app.get("/lego/sets", (req,res) => {

    // If there is a "theme" query parameter present
    const theme = req.query.theme;

    if(theme){
        // If "theme" is present, respond with Lego data for that theme
        legoData.getSetsByTheme(theme)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(404).send(err);
        });

    } else {
        // If there is not a "theme", respond with all of the unfiltered Lego data
        legoData.getAllSets()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(404).send(err);
        });
    }

});

// This route demonstrates the getSetByNum functionality
app.get("/lego/sets/:setNum", (req,res) => {

    const setNum = req.params.setNum;

    legoData.getSetByNum(setNum)  
    .then((data) => { 
        res.send(data);
    })
    .catch((err) => {
        res.status(404).send(err);
    });  
});


// Support for a custom "404 error".  
app.use((req, res) => {
    const filePath = path.join(__dirname,"/views/404.html");
    res.status(404).sendFile(filePath);
});



