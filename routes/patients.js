// Packages
const express = require('express');
const multer = require('multer');
const mysql = require('mysql');


// Router
const router = express.Router();


// Joi Validation Schema
const { patientSchema } = require('../joiSchemas');


// Joi Validators
const validatePatient = (req, res, next) => {
    const { error } = patientSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


// Utilities
const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');


// Storage destination for the photos coming from form
const upload = multer({ dest: 'uploads/' });


// Setting up the database
const db = mysql.createConnection({
    port: '/var/run/mysqld/mysqld.sock',
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'test'
});


// API Routes
router.get('/', catchError(async (req, res, next) => {
    let sql = `SELECT patient_id, patient_name, patient_address, patient_email, patient_number, patient_password, psychiatrists_name FROM patients JOIN psychiatrists ON patients.psychiatrist_id=psychiatrists.psychiatrist_id `;
    db.query(sql, (err, data, fields) => {
        if (err) {
            const msg = `Couldn't fetch the patients data!`;
            throw new ExpressError(msg, 400);
        }
        let result = 'No patients exist in the database.';
        let message = 'Successful response, but no data.';
        if (data.length !== 0) {
            result = data;
            message = 'Data retrieved successfully!'
        }
        res.json({
            status: 200,
            result,
            message
        });
    });
}));

router.get('/:hospital_id/new', catchError(async (req, res) => {
    const { hospital_id } = req.params;
    let sql = `SELECT hospital_name, psychiatrist_id, psychiatrists_name FROM hospitals JOIN psychiatrists ON hospitals.hospital_id=psychiatrists.hospital_id WHERE hospitals.hospital_id=${ hospital_id };`;
    db.query(sql, (err, data, fields) => {
        if (err) {
            const msg = `Couldn't fetch the hospital's and psychiatrist's data!`;
            throw new ExpressError(msg, 400);
        }
        const temp = Object.values(data);
        const psychiatrists = [];
        const hospital_name = temp[0].hospital_name;
        for (let i = 0; i < temp.length; i++) {
            psychiatrists.push({ psychiatrist_id: temp[i].psychiatrist_id, psychiatrist_name: temp[i].psychiatrists_name });
        }
        console.log(psychiatrists);
        res.render('form', { psychiatrists: psychiatrists, hospital_name: hospital_name, hospital_id: hospital_id });
    });
}));

router.post('/:hospital_id/new', upload.any(), validatePatient, catchError(async (req, res, next) => {
    const { hospital_id } = req.params;
    console.log(req.body);
    const { name, gender, address, email, number, password, psychiatrist_id } = req.body;
    
    let sql = `INSERT INTO patients(hospital_id, psychiatrist_id, patient_name, patient_address, patient_email, patient_number, patient_password) VALUES (${ hospital_id }, ${ psychiatrist_id }, '${ name }', '${ address }', '${ email }', '${ number }', '${ password }')`;
    db.query(sql, (err, data, fields) => {
        if (err) {
            const msg = `Couldn't post patient data to the SQL database!`;
            throw new ExpressError(msg, 400);
        }
        res.redirect(`/patient`);
    });
}));


module.exports = router;