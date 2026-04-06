import { io } from "socket.io-client";
const socket = io("http://localhost:3000", {
    auth: {
        token: localStorage.getItem("token")
    }
});

logout();

function logout() {
    localStorage.removeItem("token");
    socket.disconnect();
    window.location.href = '/home.html';
}
