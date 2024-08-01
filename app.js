const express = require('express');
const { Pool } = require('pg');
const createTable = require('./db.js');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const indexRoute = require('./Routes/index')



app.use('/api', indexRoute);

const port = process.env.PORT || 3000;
//  createTable();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
