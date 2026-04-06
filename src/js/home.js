import { getSocket } from './socket.js'

export function request_get_home_content() {
  const s = getSocket(); if (s) s.emit('request_get_home_content', {});
}

export function on_response_get_home_content(cb) {
  const s = getSocket(); if (s) s.on('response_get_home_content', (data) => cb(data));
}
