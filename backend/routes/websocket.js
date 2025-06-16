const jwt = require('jsonwebtoken');
const db = require('../db/connection');

// Store active connections
const connections = new Map();

function websocketHandler(ws, req) {
  let userId = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      // Handle authentication
      if (data.type === 'authenticate') {
        const token = data.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            return;
          }
          userId = decoded.id;
          connections.set(userId, ws);
          ws.send(JSON.stringify({ type: 'authenticated' }));
        });
        return;
      }

      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
        return;
      }

      // Handle different message types
      switch (data.type) {
        case 'i_arrived':
          await handleArrival(userId, data);
          break;
        case 'where_are_you':
          await handleLocationRequest(userId, data);
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      connections.delete(userId);
    }
  });
}

async function handleArrival(userId, data) {
  try {
    // Store arrival in database
    await db.runAsync(
      'INSERT INTO arrivals (user_id, latitude, longitude, timestamp) VALUES (?, ?, ?, datetime("now"))',
      [userId, data.location.lat, data.location.lng]
    );

    // Get user's contacts
    const contacts = await db.allAsync(`
      SELECT contact_id FROM contacts WHERE user_id = ?
    `, [userId]);

    // Notify all contacts
    const arrivalMessage = {
      type: 'arrival_update',
      from: userId,
      location: data.location,
      timestamp: new Date().toISOString()
    };

    contacts.forEach(contact => {
      const contactWs = connections.get(contact.contact_id);
      if (contactWs) {
        contactWs.send(JSON.stringify(arrivalMessage));
      }
    });
  } catch (err) {
    console.error('Handle arrival error:', err);
    throw err;
  }
}

async function handleLocationRequest(userId, data) {
  try {
    // Store request in database
    await db.runAsync(
      'INSERT INTO location_requests (from_user, to_user, timestamp) VALUES (?, ?, datetime("now"))',
      [userId, data.to]
    );

    // Send request to target user
    const targetWs = connections.get(data.to);
    if (targetWs) {
      targetWs.send(JSON.stringify({
        type: 'location_request',
        from: userId
      }));
    }
  } catch (err) {
    console.error('Handle location request error:', err);
    throw err;
  }
}

module.exports = websocketHandler; 