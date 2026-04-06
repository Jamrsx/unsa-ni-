<script setup>
// Dynamically resolve server URL — works for localhost and LAN testers
const SERVER_URL = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
  return 'http://' + h + ':3000';
})();


    import '/public/css/bootstrap/bootstrap-5.0.2-dist/css/bootstrap.min.css';
    import { ref } from 'vue';
    import axios from 'axios';
    import { io } from 'socket.io-client';

    import { getSocket } from './js/socket.js';
    const socket = getSocket();

    const clientId = Date.now(); // unique id for this client
    const message = ref('');
    const messages = ref([]);

    // Listen for messages from server
    socket.on('message', (msg) => {
        // ignore messages sent by this client
        if (msg.clientId === clientId) return;

        messages.value.push({ text: msg.text, self: false, id: Date.now() });
    });

    const submit = async () => {
        // add message to messages as self
        messages.value.push({ text: message.value, self: true, id: Date.now() });

        // send to server with clientId
        await axios.post(SERVER_URL + '/api/message', {
            message: message.value,
            clientId
        });

        message.value = '';
    };

</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-3 vh-100">
                <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
                    <div class="list-group list-group-flush border-bottom scrollarea">
                        <a href="#" class="list-group-item list-group-item-action active py-3 lh-tight" aria-current="true">
                            <div class="d-flex w-100 align-items-center justify-content-between">
                            <strong class="mb-1">Venom Snake</strong>
                            <small>Sat</small>
                            </div>
                            <div class="col-10 mb-1 small">Last messages</div>
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-9 border">
                <div id="head" class="py-3 lh-sm border-bottom">
                    <strong class="mb-1">Venom Snake, Prequod</strong>
                </div>
                <div id="conversation">
                    <div class="row pt-2" v-for="msg of messages" :key="msg.id">
                        
                        <div class="col-12 row text-end" v-if="msg.self">
                            <div class="col-6"></div>
                            <div class="col-6 alert alert-success d-inline-block">
                                {{msg.text}}
                            </div>
                        </div>

                        <div class="col-12 row" v-else>
                            <div class="col-6 alert alert-primary d-inline-block">
                                {{ msg.text }}
                            </div>
                            <div class="col-6"></div>
                        </div>
                    </div>
                    <!-- <div class="row pt-2">
                        <div class="col-6"></div>
                        <div class="col-6">
                            <div class="alert alert-primary float-end d-inline-block">
                                Whatsup
                            </div>
                        </div>
                    </div> -->
                </div>
                <form id="reply" class="p-3 w-100" @submit.prevent="submit">
                    <div class="input-group">
                        <!-- // 1/3 send to v-model (universal) "message" to send its message.value to socket -->
                        <input id="textbox" class="form-control" placeholder="Write message here" v-model="message">
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
    #head{
        height: 50px;
    }
    #conversation{
        overflow-y: scroll;
        height: calc(100vh - 120px);
    }
    #reply{
        height: 70px;
    }
</style>
