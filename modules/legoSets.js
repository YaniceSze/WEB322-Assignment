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

// The purpose of the "legoSets.js" file is to provide easy access to the Lego data for other files within our assignment that require it.
// Automatically read both files and generate two arrays of objects:
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// The completed array of Lego "set" objects after processing the above two arrays
let sets = [];

// Function to fill the "sets" array by adding copies of all the setData objects and include a new "theme" property
const initialize = () => {

    return new Promise((resolve,reject)=>{

        try{
            setData.forEach((set)=>{
                // Loop through array to find the matched theme name
                let theme = themeData.find(theme => theme.id == set.theme_id);

                if(theme)
                {
                    // Include theme name into the sets array
                    let tempSet = {...set, theme: theme.name};
                    sets.push(tempSet);
                }

            });

            resolve(); 

        } catch(err) {

            reject(err.message);
        }
    });
}

// Function to return the complete "sets" array
const getAllSets = () => {

    return new Promise((resolve,reject) => {

        if(sets.length){

            resolve(sets);
        }
        else
        {
            reject("No sets is found!")
        }

    });

}

// Function to return a specific "set" object from the "sets" array ("set_num" value matches the value of the "setNum" parameter)
const getSetByNum = (setNum) => {

    return new Promise((resolve, reject) => {

        let set = sets.find((set)=> set.set_num == setNum);

        if(set){
            // Return the specific set 
            resolve(set);

        } else {
            // Return the error message if the set was not found
            reject("Unable to find requested set!");
        }

    });

}

// Function to return an array of objects from the "sets" array ("theme" value matches the "theme" parameter)
const getSetsByTheme = (theme) => {

    return new Promise((resolve, reject) => {

        let filteredSetArray = sets.filter((set)=>set.theme.toLowerCase().includes(theme.toLowerCase()));

        if(filteredSetArray.length){
            // Return an array 
            resolve(filteredSetArray);
    
        } else {
            // Return the error message if the sets were not found
            reject("Unable to find requested sets!");
        }

    });

}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };