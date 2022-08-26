if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const ejsMate = require('ejs-mate');


// Routers
const patientsRouter = require('./routes/patients');
const hospitalsRouter = require('./routes/hospitals');


// Creating an express application
const app = express();


// Setting template engine
app.engine('ejs', ejsMate);


// Setting view engine and 'views' directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


// APIs
app.get('/', (req, res, next) => {
    res.send('<h1>Lattice Assignment</h1>');
})
app.use('/hospital', hospitalsRouter);
app.use('/patient', patientsRouter);


// Error Handling Middlewares
app.use((err, req, res, next) => {
    console.log(err);
    next(err);
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err;
    console.log(statusCode, message);
    next(err);
});


// Starting the server
app.listen(4200, () => {
    console.log('Serving on port 4200...');
});