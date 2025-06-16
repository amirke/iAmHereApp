let socket;

export function connectWebSocket(userId) {
  socket = new WebSocket(`wss://your-server/ws?user=${userId}`);
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
