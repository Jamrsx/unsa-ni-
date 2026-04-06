<script>
/**
 * DRAFT QUESTIONS TABLE (Admin View)
 * 
 * Displays all questions with status='draft' from all users
 * Allows admin to view draft questions before they are submitted for approval
 * 
 * Props:
 *   - rows: Array of draft question objects from backend
 * 
 * Emits:
 *   - view-question: When admin clicks on a draft question to view details
 * 
 * Data Structure:
 *   {
 *     approval_id: number,
 *     question_name: string,
 *     question_difficulty: 'Easy' | 'Medium' | 'Hard',
 *     author_username: string,
 *     created_at: timestamp
 *   }
 */
import TableList from '../../../table-list.vue';
import { defineProps, defineEmits } from 'vue';

export default {
  components: {
    TableList
  }
};
</script>

<template>
  <!-- Draft Questions Table: Shows questions saved as draft (not submitted for approval) -->
  <TableList :column_slot="['question_name', 'difficulty', 'author', 'created_at']">
    <template #question_name>
      <div class="window-table-header">
        <p>Question Name</p>
      </div>
    </template>
    <template #difficulty>
      <div class="window-table-header">
        <p>Difficulty</p>
      </div>
    </template>
    <template #author>
      <div class="window-table-header">
        <p>Author</p>
      </div>
    </template>
    <template #created_at>
      <div class="window-table-header">
        <p>Created Date</p>
      </div>
    </template>
    <template #table_rows>
      <!-- Loop through draft questions -->
      <tr 
        v-for="(q, index) in rows" 
        :key="q.approval_id"
        @click="$emit('view-question', q.problem_id)"
        style="cursor: pointer;"
      >
        <td>{{ index + 1 }}. {{ q.question_name }}</td>
        <td>{{ q.question_difficulty }}</td>
        <td>{{ q.author_username }}</td>
        <td>{{ formatDate(q.created_at) }}</td>
      </tr>
      <!-- Empty state -->
      <tr v-if="!rows || rows.length === 0">
        <td colspan="4" class="text-center text-muted">No draft questions</td>
      </tr>
    </template>
  </TableList>
</template>

<script setup>
// === Props: Draft questions data from parent (AdminDashboard) ===
// Receives array of draft questions fetched from backend
const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  }
});

// === Emits: Events to parent component ===
// view-question: Triggered when admin clicks on a draft question row
const emit = defineEmits(['view-question']);

// === Helper: Format date for display ===
// Converts ISO timestamp to human-readable format
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
