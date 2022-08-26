// Packages
const express = require('express');
const mysql = require('mysql');
const async = require('async');


// Router
const router = express.Router();


// Utilities
const catchError = require('../utils/catchError');
const ExpressError = require('../utils/ExpressError');


// Setting up the database
const db = mysql.createConnection({
    port: '/var/run/mysqld/mysqld.sock',
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'test'
});


// API Routes
router.get('/:hospital_id', catchError(async (req, res) => {
    const { hospital_id } = req.params;
    let sql = `SELECT patient_id, patient_name, patients.psychiatrist_id, psychiatrists_name, patients.hospital_id, hospital_name FROM patients JOIN hospitals ON patients.hospital_id=hospitals.hospital_id JOIN psychiatrists ON patients.psychiatrist_id=psychiatrists.psychiatrist_id WHERE patients.hospital_id=${ hospital_id }`;
    db.query(sql, async (err, data, fields) => {
        if (err) {
            const msg = `Couldn't fetch the hospital's data!`;
            throw new ExpressError(msg, 400);
        }
        const temp = Object.values(data);
        // console.log(temp);

        const result = {};
        result.hospitalName = temp[0].hospital_name;
        result.hospitalPatientsCount = temp.length;
        
        await async.parallel([
            function(parallel_done) {
                let sql_1 = `SELECT psychiatrist_id, psychiatrists_name from psychiatrists WHERE hospital_id=${ hospital_id }`;
                db.query(sql_1, {}, (err, results) => {
                    if (err) {
                        return parallel_done(err);
                    }
                    result.hospitalPsychiatristsCount = results.length;
                    result.psychiatristsDetails = [];
                    for (let i = 0; i < results.length; i++) {
                        result.psychiatristsDetails.push({ psychiatrist_id: results[i].psychiatrist_id, psychiatrist_name: results[i].psychiatrists_name, patientsCount: 0 });
                    }
                    parallel_done();
                });
            }
        ]);
        for (let i = 0; i < result.hospitalPatientsCount; i++) {
            const x = temp[i].psychiatrist_id;
            for (let j = 0; j < result.psychiatristsDetails.length; j++) {
                if (result.psychiatristsDetails[j].psychiatrist_id === x) {
                    result.psychiatristsDetails[j].patientsCount++;
                    break;
                }
            }
        }
        console.log(result);
        res.json({
            status: 200,
            result,
            message: 'Data retrieved successfully!'
        });
    });
}));


module.exports = router;