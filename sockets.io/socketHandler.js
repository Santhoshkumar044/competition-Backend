// export function setupSocket(io) {
//   io.on('connection', (socket) => {
//     console.log('🔌 New connection:', socket.id);

//     // Connection health check
//     socket.on('ping', (callback) => {
//       try {
//         console.log(`🏓 Ping from ${socket.id}`);
//         callback({ status: 'pong', timestamp: new Date().toISOString() });
//       } catch (err) {
//         console.error('Ping error:', err);
//         callback({ status: 'error', error: err.message });
//       }
//     });

//     // Error handling
//     socket.on('error', (err) => {
//       console.error(`Socket error (${socket.id}):`, err);
//     });

//     // Cleanup on disconnect
//     socket.on('disconnect', (reason) => {
//       console.log(`❌ Disconnected: ${socket.id} (${reason})`);
//     });
//   });

//   // Centralized event emitters
//   io.emitVenueStatusChange = (roomnumber, status) => {
//     try {
//       io.emit('venue/status', { 
//         roomnumber, 
//         status,
//         updatedAt: new Date().toISOString() 
//       });
//       console.log(`📡 Emitted venue status: ${roomnumber} => ${status}`);
//     } catch (err) {
//       console.error('Emit error:', err);
//     }
//   };

//   io.emitEventUpdate = (eventId, action) => {
//     io.emit('event/update', { eventId, action });
//   };

//   console.log('✅ Socket.IO handlers ready');
// }

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id);

    socket.on('ping', (callback) => {
      try {
        console.log(`🏓 Ping from ${socket.id}`);
        callback({ status: 'pong', timestamp: new Date().toISOString() });
      } catch (err) {
        console.error('Ping error:', err);
        callback({ status: 'error', error: err.message });
      }
    });

    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected: ${socket.id} (${reason})`);
    });
  });

  // ✅ CHANGED: Emit by venue name instead of roomnumber
  io.emitVenueStatusChange = (name, status) => {
    try {
      io.emit('venue/status', {
        name, // ✅ changed
        status,
        updatedAt: new Date().toISOString()
      });
      console.log(`📡 Emitted venue status: ${name} => ${status}`);
    } catch (err) {
      console.error('Emit error:', err);
    }
  };

  io.emitEventUpdate = (eventId, action) => {
    io.emit('event/update', { eventId, action });
  };

  console.log('✅ Socket.IO handlers ready');
}
