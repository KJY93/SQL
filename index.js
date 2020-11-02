// Load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise') // Get mysql driver with promise support
const getPage = require('./utils/Page.js')

// Declaring constant
const OFFSET_LIMIT = 10

// Configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// Create the database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'playstore',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    timezone: '+08:00',
})

const startApp = async (app, pool) => {
    try {
        // Acquire a connection from the connection pool
        const conn = await pool.getConnection()
        console.info('Pinging database...')
        await conn.ping()

        // Release the connection
        conn.release()

        // Start the server
        app.listen(
            PORT,
            () => {
                console.info(`Application started on PORT ${PORT} at ${new Date()}`)
            }
        )
    }   
    catch (err) {
        console.error('Cannot ping database: ', err)
    }
} 

// Create an instance of application
const app = express()

// Configure handlebars 
app.engine('hbs', handlebars({
    defaultLayout: 'default.hbs'
}))
app.set('view engine', 'hbs')

// Configuring the application
app.get('/', (req, res) => {
    res.status(200)
    res.type('text/html')
    res.render('index')
})

app.get('/search', async (req, res) => {
    const q = req.query['q']
    // Acquire a connection from the pool
    const conn = await pool.getConnection()

    // For the first query, currOffsetIndex is zero. Similar to prevOffsetIndex as we are on the first page
    // NextOffsetIndex would be currOffsetIndex + 10
    let currOffsetIndex = 0
    let prevOffsetIndex = currOffsetIndex
    let nextOffsetIndex = currOffsetIndex + OFFSET_LIMIT

    try {
        // Call the getPage function to query the data from the DB
        getPage (res, conn, q, currOffsetIndex, prevOffsetIndex, nextOffsetIndex)
    }
    catch (err) {
        console.error(err)
    }
    finally {
        conn.release()
    }
})

// Prev Page
app.get('/prev/:q/:offset', async (req, res) => {
    // Getting params from url
    let getOffset = parseInt(req.params.offset)
    let q = req.params.q
    
    const conn = await pool.getConnection()

    // Setting currOffsetIndex value to the offset value passed in from the url
    let currOffsetIndex = getOffset
    // Minus currOffsetIndex by OFFSET_LIMIT to get prev page index 
    let prevOffsetIndex = currOffsetIndex - OFFSET_LIMIT
    // Add currOffsetIndex by OFFSET_LIMIT to get next page index 
    let nextOffsetIndex = currOffsetIndex + OFFSET_LIMIT

    try {
        // Call the getPage function to query the data from the DB
        getPage (res, conn, q, currOffsetIndex, prevOffsetIndex, nextOffsetIndex)
    }
    catch (err) {
        console.error(err)
    }
    finally {
        conn.release()
    }
})

// Next Page
app.get('/next/:q/:offset', async (req, res) => {
    // Getting params from url
    let getOffset = parseInt(req.params.offset)
    let q = req.params.q

    const conn = await pool.getConnection()

    // Setting currOffsetIndex value to the offset value passed in from the url
    let currOffsetIndex = getOffset
    // Minus currOffsetIndex by OFFSET_LIMIT to get prev page index 
    let prevOffsetIndex = currOffsetIndex - OFFSET_LIMIT
    // Add currOffsetIndex by OFFSET_LIMIT to get next page index 
    let nextOffsetIndex = currOffsetIndex + OFFSET_LIMIT

    try {
        // Call the getPage function to query the data from the DB
        getPage (res, conn, q, currOffsetIndex, prevOffsetIndex, nextOffsetIndex)
    }
    catch (err) {
        console.error(err)
    }
    finally {
        conn.release()
    }
})

startApp(app, pool)
