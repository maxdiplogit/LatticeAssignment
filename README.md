# Libraries Used
multer -> To upload patient photos
ejs -> For HTML temmplating
body-parser -> For parsing incoming data on any request object
path -> To join directories so that they can just be called by their name
express -> To create an express application
joi -> For validation from incoming form
mysql -> To access the mysql database
async -> For making parallel queries to the MySQL database


# API Endpoints
GET /hospital/<hospital_id> -> The main API, that fetches all the psychiatrists, their count along with their IDs and patient details for a hospital.
GET /patient -> Fetches all the patients from the MySQL database.
POST /patient/<hospital_id>/new -> Creates a new patients entry in the MySQL database.


# Postman Collections Link
https://www.postman.com/collections/27f0b0571fcd645ef10a
