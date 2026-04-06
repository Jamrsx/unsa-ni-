import { getSocket } from './socket.js'

export function request_get_blogs() {
  const s = getSocket(); if (s) s.emit('request_get_blogs', {});
}

export function on_response_get_blogs(cb) {
  const s = getSocket(); if (s) s.on('response_get_blogs', (data) => cb(data));
}

export function request_get_blog_by_id(id) {
  const s = getSocket(); if (s) s.emit('request_get_blog_by_id', { blog_id: id });
}

export function on_response_get_blog_by_id(cb) {
  const s = getSocket(); if (s) s.on('response_get_blog_by_id', (data) => cb(data));
}
