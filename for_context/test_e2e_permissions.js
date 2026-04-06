const { io } = require('socket.io-client');
const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('Usage: node test_e2e_permissions.js <token>');
  process.exit(1);
}

const socket = io('http://localhost:3000', { auth: { token: TOKEN }, transports: ['websocket'], extraHeaders: { Origin: 'http://localhost:5173' } });

socket.on('connect', () => {
  console.log('connected', socket.id);
  // Request my permissions
  socket.emit('request_get_my_permissions', { token_session: TOKEN });
  socket.once('response_get_my_permissions', (data) => {
    console.log('response_get_my_permissions ->', data);

    // Now try fetching admin permissions for user 21
    socket.emit('request_get_admin_permissions', { token_session: TOKEN, target_user_id: 21 });
    socket.once('response_get_admin_permissions', (d2) => {
      console.log('response_get_admin_permissions ->', d2 && d2.success ? `${d2.permissions.length} permissions` : d2);
      socket.close();
      process.exit(0);
    });
  });
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message);
  process.exit(2);
});

socket.on('error', (e) => { console.error('socket error', e); });

setTimeout(() => { console.error('timeout'); process.exit(3); }, 10000);
