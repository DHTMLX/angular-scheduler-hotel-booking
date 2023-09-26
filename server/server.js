const express = require('express'); // use Express
const app = express(); // create application
const port = 3000; // port for listening
const cors = require('cors');
app.use(cors()); // enable CORS for all routes

// MySQL will be used for db access and util to promisify queries
const util = require('util');
const mysql = require('mysql');

// use your own parameters for database
const mysqlConfig = {
	'connectionLimit': 10,
	'host': 'localhost',
	'user': 'root',
	'password': '',
	'database': 'room_reservation_node'
};

app.use(express.json()); // Enable JSON body parsing
// return static pages from the './public' directory
app.use(express.static(__dirname + '/public'));

// start server
app.listen(port, () => {
	console.log('Server is running on port ' + port + '...');
});

const router = require('./router');

// open connection to mysql
const connectionPool = mysql.createPool(mysqlConfig);
connectionPool.query = util.promisify(connectionPool.query);

// add listeners to basic CRUD requests
const DatabaseHandler = require('./databaseHandler');
const databaseHandler = new DatabaseHandler(connectionPool);
router.setRoutes(app, '/data', databaseHandler);
