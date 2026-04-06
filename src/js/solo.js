import { getSocket } from './socket.js';

function err(message) {
    alert(message);
}

export function get_solo_questions(callback) {
    const token_session = localStorage.getItem('jwt_token');
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for get_solo_questions');
        callback && callback({ success: false, message: 'No socket', questions: [] });
        return;
    }

    s.emit('request_get_solo_questions', { token_session });

    s.off('response_get_solo_questions');
    s.on('response_get_solo_questions', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to load questions');
            callback && callback(data);
            return;
        }
        callback && callback(data);
    });
}

export function filter_solo_questions(filters, callback) {
    const token_session = localStorage.getItem('jwt_token');
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for filter_solo_questions');
        callback && callback({ success: false, message: 'No socket', questions: [] });
        return;
    }

    s.emit('request_filter_solo_questions', {
        token_session,
        search: filters.search,
        sortOrder: filters.sortOrder,
        difficulty: filters.difficulty,
        progress: filters.progress,
        topicIds: filters.selectedTopics
    });

    s.off('response_filter_solo_questions');
    s.on('response_filter_solo_questions', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to filter questions');
            callback && callback(data);
            return;
        }
        callback && callback(data);
    });
}

export function get_solo_problem_details(problem_id, callback) {
    const token_session = localStorage.getItem('jwt_token');
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for get_solo_problem_details');
        callback && callback({ success: false, message: 'No socket' });
        return;
    }

    s.emit('request_get_solo_problem_details', { token_session, problem_id });

    s.off('response_get_solo_problem_details');
    s.on('response_get_solo_problem_details', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to load problem details');
            callback && callback(data);
            return;
        }
        callback && callback(data);
    });
}

export function create_solo_problem(problemData, callback) {
    const token_session = localStorage.getItem('jwt_token');
    const s = getSocket();
    if (!s) {
        console.warn('No socket available for create_solo_problem');
        err('No socket available');
        return;
    }

    s.emit('request_create_problem', { token_session, problemData });

    s.off('response_create_problem');
    s.on('response_create_problem', (data) => {
        if (!data.success) {
            err(data.message || 'Failed to submit question');
            return;
        }
        callback && callback(data);
    });
}
