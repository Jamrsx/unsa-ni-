<template>
  <div class="row flex-column">
    <div class="col row flex-row">
      <div class="col">
        <GridLayoutContainer>
          <GridLayoutCard>
            <CardDashboardReview title="Total Users" :value="total_users" icon="/asset/general/match.png" />
            <CardDashboardReview title="Total Problems" :value="total_problems" icon="/asset/general/match.png" />
            <CardDashboardReview title="Total Events" :value="total_events" icon="/asset/general/match.png" />
            <CardDashboardReview title="Pending Approvals" :value="total_pending" icon="/asset/general/match.png" />
          </GridLayoutCard>
        </GridLayoutContainer>
      </div>
    </div>

    <hr />

    <div class="col row flex-row">
      <div class="col">
        <div class="info-section">
          <h4>Faculty Overview</h4>
          <p>Welcome to the faculty dashboard. Here you can manage users, problems, events, blogs, and review pending changes.</p>
          <ul>
            <li>Manage and view users</li>
            <li>Create and edit problems</li>
            <li>Organize and manage events</li>
            <li>Post and manage blogs</li>
            <li>Review and forward changes for admin approval</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CardDashboardReview from '../../card-dashboard-review.vue'
import GridLayoutCard from '../../grid-layout-card.vue'
import GridLayoutContainer from '../../grid-layout-container.vue'

defineProps({
  total_users: { type: Number, default: 0 },
  total_problems: { type: Number, default: 0 },
  total_events: { type: Number, default: 0 },
  total_pending: { type: Number, default: 0 }
})
</script>

<style scoped>
.info-section {
  background: var(--c_slightlightcoding);
  padding: 20px;
  border-radius: 8px;
}
.info-section h4 { margin-top: 0; margin-bottom: 15px; font-size: 18px; }
.info-section p { margin-bottom: 15px; }
.info-section ul { margin: 0; padding-left: 20px; }
.info-section li { margin-bottom: 8px; }
</style>
