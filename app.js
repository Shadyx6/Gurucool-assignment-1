const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isLoggedIn = require('./middlewares/isLoggedIn')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { redis, createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const promClient = require('prom-client');

const client = createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14431.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 14431
    }
});

// prom client
// Add prom-client
// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'your-app-name'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Expose the metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// checking redis connection
client.connect().then(() => {
    console.log('Redis client connected');
  }).catch((err) => {
    console.error(err);
  });

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json());

//Global error handling for robustness
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error has ocurred');
});

// Graceful shutdown for robustness 
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        client.quit(); 
        process.exit(0);
    });
});

const users = []; // memory for simplicity

// register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    let token = jwt.sign({ username }, process.env.JWT_SECRET)
    res.cookie('token', token)
    res.status(201).send('User registered');
});

// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token)
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// example of a protected route
app.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hi ${req.user.username}, this is a protected route`);
});

// queueing route
app.post('/enqueue', isLoggedIn, async (req, res) => {
    try {
        let queueName = `queue: ${req.user.username}`
        const reqData = JSON.stringify(req.body)
        await client.rPush(queueName, reqData)
        res.send('Request enqueued')
    } catch (error) {
        console.log(error)
        res.status(500).send("Error enqueueing request")
    }
   
});

// processing the user's queue
app.post('/process-queue', isLoggedIn, async (req,res) => {
    try {
        const queueName = `queue: ${req.user.username}`
    const reqData = await client.lPop(queueName);

    if(reqData){
        res.send(`Processed request : ${reqData}`)
    }
    else{
        res.send('No requests available')
    }
    } catch (error) {
        console.log(error)
        res.status(500).send("Error processing request")
    }
    
})


// logout route for testing purpose
app.get('/logout', (req,res) => {
    res.clearCookie('token');
    res.send('Logged out');
})

app.get('/', (req,res) => {
 res.send("This is the assignment that is assigned to me for backend role from Gurucool")
})

app.listen(3000, () => {
    console.log('Server running on port 3000');
});




module.exports = app