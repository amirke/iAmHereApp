require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const WebSocket = require('ws');

const { PORT, HOST, BACKEND_NAME } = require('./config');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');
const websocketHandler = require('./routes/websocket');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ MIDDLEWARE — MUST COME FIRST
app.use(cors({
  origin: '*', // later: ['http://localhost:5173']
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

// ✅ ROUTES
app.use('/api', apiRoutes);
app.use('/api/user', userRoutes);

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ WEBSOCKET
wss.on('connection', websocketHandler);

// ✅ START SERVER
server.listen(PORT, () => {
  console.log(`${BACKEND_NAME} listening at http://${HOST}:${PORT}`);
});
