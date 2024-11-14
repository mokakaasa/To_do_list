<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

// Get activities from Inertia's page props
const activities = usePage().props.activities;

// State to track whether to show completed activities
const showCompleted = ref(false);
const showPending = ref(false);

// State to store the filtered completed activities
const completedActivities = ref([]);
const pendingActivities = ref([]);

const completedCount = computed(() => completedActivities.value.length);
const pendingCount = computed(() => pendingActivities.value.length);

// Toggle function to change the state and filter the activities
function toggleCompleted() {
  if (!showCompleted.value) {
    // Filter completed activities and store them in completedActivities
    completedActivities.value = activities.filter(activity => activity.status_id === 1);
  
    
  } else {
    // Hide the completed activities list
    completedActivities.value = [];
  }
  
  // Toggle the visibility
  showCompleted.value = !showCompleted.value;

  
}


// Toggle function to change the state and filter the activities
function togglePending() {
  if (!showPending.value) {
    // Filter completed activities and store them in completedActivities
    pendingActivities.value = activities.filter(activity => activity.status_id === 2);
  } else {
    // Hide the completed activities list
    pendingActivities.value = [];
  }
  
  // Toggle the visibility
  showPending.value = !showPending.value;
}
</script>

<template>
  <h1>All Activities</h1>
 
  <!-- Button to toggle completed activities -->
  <button @click="toggleCompleted">
    {{ showCompleted ? `Completed Activities (${completedCount})` : 'Completed Activities' }}
  </button>


  <!-- Completed Activities List -->
  <ul v-if="showCompleted" :class="activity-list">
    <li v-for="activity in completedActivities" :key="activity.id">
      {{ activity.activity }}
    </li>
  </ul>

  

  <!-- Button to toggle completed activities -->
  <button @click="togglePending">
    {{ showPending ? `Pending Activities (${pendingCount})` : 'Pending Activities' }}
  </button>

  <!-- Completed Activities List -->
  <ul v-if="showPending" :class="activity-list">
    <li v-for="activity in pendingActivities" :key="activity.id">
      {{ activity.activity }}
    </li>
  </ul>

</template>


<style scoped>
.activity-list {
  margin-top: 10px;
}

button {
  cursor: pointer;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
  display: block;
}

button:hover {
  background-color: #45a049;
}
</style>
