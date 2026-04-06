<template>
  <div class="mail-container">
    <scroll-vertical-carousel>
      <scroll-card v-for="(msg, index) in messages" :key="index">
        <card-email
          :title="msg.title"
          :date="msg.date"
          @select="selected = msg"
        />
      </scroll-card>
    </scroll-vertical-carousel>

    <card-email-content
      v-if="selected"
      :title="selected.title"
      :date="selected.date"
      :body="selected.body"
      @delete="deleteEmail(selected)"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue';
import ScrollCard from '../../scroll-card.vue';
import CardEmail from "../../card-email.vue";
import CardEmailContent from "../../card-email-content.vue";

// brubs: hey edit here for messages, or else replace them inside template
const messages = ref([
  {
    title: "Match finished",
    date: "12/06/25",
    body: "Lorem ipsum dolor sit amet consectetur..."
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: ""
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Friend request",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  },
  {
    title: "Room invited",
    date: "12/06/25",
    body: "A new player added you!"
  }
]);

const selected = ref(messages.value[0]);
console.log(selected);

function deleteEmail(msg) {
  const i = messages.value.indexOf(msg);
  if (i !== -1) messages.value.splice(i, 1);
  selected.value = messages.value[0] || null;
}
</script>
