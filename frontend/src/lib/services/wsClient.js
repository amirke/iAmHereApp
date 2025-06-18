import { getWebSocketUrl } from '../config.js';

let socket;

export function connectWebSocket(userId) {
  const wsUrl = getWebSocketUrl();
  socket = new WebSocket(`${wsUrl}/ws?user=${userId}`);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'location_request') {
      // Future handler here
    }
  };
}

export function sendArrival(location, timestamp) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'i_arrived',
      location,
      timestamp
    }));
  }
}
