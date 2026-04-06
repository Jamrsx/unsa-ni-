// Dynamically resolve server URL — works for localhost and LAN testers
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();

import { io } from "socket.io-client";
const socket = io(SERVER_URL);

// error mesg
function err(message){
    alert(message);
}

export function handleSignUp (e){
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    // password confimation function is missing
    const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if(!(passwordPattern.test(password))){
        err('Password is weak: Must be at least 8 characters and contains at least one symbol');
    } else if (!(password === confirmPassword)){
        err("Password cofirmation not matched: Password and confirm password should match");
    } else {
        // if success
        socket.emit('signup', { username, email, password });
    }
}

export function response() {
    socket.on('signup_result', (data) => {
        if (data.success) {
            localStorage.setItem('jwt_token', data.token);
            socket.disconnect();
            window.location.href = '/';
        } else {
            err(data.message);
        }
    });
}
