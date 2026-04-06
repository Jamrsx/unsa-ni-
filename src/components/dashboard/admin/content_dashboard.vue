<template>
  <div class="row flex-column">
    <div class="col row flex-row">
      <div class="col">
        <GridLayoutContainer>
          <GridLayoutCard>
            <!-- Dashboard Cards -->
            <CardDashboardReview
              title="Total Users"
              :value="localTotalUser"
              icon="/asset/general/match.png"
            />
            <CardDashboardReview
              title="Total Question Set"
              :value="localTotalQuestionSet"
              icon="/asset/general/match.png"
            />
            <!-- Example static cards -->
            <CardDashboardReview
              title="Test"
              :value="2000"
              icon="/asset/general/match.png"
            />
            <CardDashboardReview
              title="Test"
              :value="100"
              icon="/asset/general/match.png"
            />
          </GridLayoutCard>
        </GridLayoutContainer>
      </div>

      <div class="col">
        <CardEventTimeline
          hyperlink="/"
          img-src="/asset/event/eventname.png"
          title="Coding Competition"
          start-time="06/04/25 00:09:00 UTC"
          end-time="28/04/25 00:09:00 UTC"
        />
      </div>
    </div>

    <hr />

    <div class="col row flex-row">
      <div class="col">
        <canvas ref="canvas" style="max-height:300px"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue"
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"

import CardDashboardReview from '../../card-dashboard-review.vue'
import CardEventTimeline from '../../card-event-timeline.vue'
import GridLayoutCard from '../../grid-layout-card.vue'
import GridLayoutContainer from '../../grid-layout-container.vue'

// ==========================
// Props from parent
// ==========================
const props = defineProps({
  total_user: Number,
  total_question_set: Number
})

// ==========================
// Local reactive variables
// ==========================
const localTotalUser = ref(props.total_user || 0)
const localTotalQuestionSet = ref(props.total_question_set || 0)

// ==========================
// Watch props for automatic updates
// ==========================
watch(() => props.total_user, val => localTotalUser.value = val || 0)
watch(() => props.total_question_set, val => localTotalQuestionSet.value = val || 0)

// ==========================
// Chart.js setup
// ==========================
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)
const canvas = ref(null)

onMounted(() => {
  if (!canvas.value) return
  new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
})
</script>
