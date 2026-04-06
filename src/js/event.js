import { getSocket } from './socket.js'

export function request_get_events() {
  const s = getSocket(); if (s) s.emit('request_get_events', {});
}

export function on_response_get_events(cb) {
  const s = getSocket(); if (s) s.on('response_get_events', (data) => cb(data));
}

export function request_get_event_by_id(id) {
  const s = getSocket(); if (s) s.emit('request_get_event_by_id', { event_id: id });
}

export function on_response_get_event_by_id(cb) {
  const s = getSocket(); if (s) s.on('response_get_event_by_id', (data) => cb(data));
}

export function request_join_event(event_id) {
  const s = getSocket(); if (s) s.emit('request_join_event', { event_id });
}

export function on_response_join_event(cb) {
  const s = getSocket(); if (s) s.on('response_join_event', (data) => cb(data));
}
