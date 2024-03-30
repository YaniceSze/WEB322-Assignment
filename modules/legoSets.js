/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: NGA TSZ SZE Student ID: 136132222 Date: 29/3/2024
*
*  Published URL: https://tricky-jeans-cod.cyclic.app
*
********************************************************************************/

// The purpose of the "legoSets.js" file is to provide easy access to the Lego data for other files within our assignment that require it.

// Access the database
require('dotenv').config();
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
});

// Define a "Theme" model
const Theme = sequelize.define('Theme', { 
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: Sequelize.STRING,
},
{
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
}
);

// Define a "Set" model
const Set = sequelize.define('Set', { 
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
},
{
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
}
);

// Create an association between the two models
Set.belongsTo(Theme, {foreignKey: 'theme_id'});

// Initialize function to invoke sequelize.sync(), synchronize the Database with our models and automatically add the table if it does not exist
function initialize() {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(()=> {
            resolve();
        })
        .catch((error)=>{
            reject(error);
        });
    });
}

// Function to return the complete "sets" array
function getAllSets() {
    return new Promise ((resolve,reject) => {
        // Use findAll method to get all sets from the database
        Set.findAll({
            include: [Theme], // Include Theme data
        })
        .then((sets) => {
            resolve(sets);
        })
        .catch((error) => {
            reject(error);
        });
    });
} 

// Function to return a specific "set" object from the "sets" array ("set_num" value matches the value of the "setNum" parameter)
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        // Use findOne method to find a single set whose set_num value matches the "setNum" parameter
        Set.findOne({
            where: {set_num: setNum},
            include: [Theme],
        })
        .then((set) => {
            if(set){
                // Return the specific set 
                resolve(set);
    
            } else {
                // Return the error message if the set was not found
                reject("Unable to find requested set!");
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
}

// Function to return an array of objects from the "sets" array ("theme" value matches the "theme" parameter)
function getSetsByTheme(theme) {
    return new Promise((resolve,reject) => {
        // Use findAll method to find the sets whose "Theme.name" property contains the string in the "theme" parameter
        Set.findAll({
            include: [Theme],
            where: { 
                '$Theme.name$': { // reference the "name" attribute of the associated "Theme" table
                  [Sequelize.Op.iLike]: `%${theme}%` //  "name" attribute of the associated "Theme" table should match the provided theme string case-insensitively
                }
            },  
        })
        .then((sets) => {
            if(sets.length > 0){
                // Return an array 
                resolve(sets);
            } else {
                // Return the error message if the sets were not found
                reject("Unable to find requested sets!");
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
}

// Function to create a new Set
function addSet(setData) {
    return new Promise((resolve,reject) => {
        Set.create(setData)
        .then(()=> {
            resolve();
        })
        .catch((err) => {
            reject(err.errors[0].message);
        });
    });
}

// Function to return all the themes
function getAllThemes(){
    return new Promise((resolve,reject) => {
        Theme.findAll()
        .then((themes) => {
            resolve(themes);
        })
        .catch((error) => {
            reject(error);
        });
    });
}

// Function to edit the existing set
function editSet(set_num, setData){
    return new Promise((resolve,reject) => {
        Set.update(setData, {
            where: { set_num: set_num },
        })
        .then(()=> {
            resolve();
        })
        .catch((err)=>{
            reject(err.errors[0].message);
        });
    });
}

// Function to remove (delete) an existing set from the database
function deleteSet(set_num) {
    return new Promise((resolve,reject) => {
        Set.destroy({
            where: {set_num: set_num},
        })
        .then(() => {
            resolve();
        })
        .catch((err)=>{
            reject(err.errors[0].message);
        });
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
