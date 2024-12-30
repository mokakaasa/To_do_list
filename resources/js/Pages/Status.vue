<script setup> 
import { ref, computed, onMounted, watch,nextTick } from 'vue';
import { usePage } from '@inertiajs/vue3';

const isLoading = ref(true); 
const activity = usePage().props.activity;

// Unified function to update activity status and handle checkbox changes
const updateActivityStatus = async (activityId, isChecked) => {
  const newStatusId = isChecked ? 1 : 2;

  // Update the local activity
  if (activity.id === activityId) {
    activity.status_id = newStatusId;
  }

  try {
    // Send the updated status to the server
    const response = await fetch(`/editstatus/${activityId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
     },
      body: JSON.stringify({
        statusId: newStatusId 
    }),
    });

    const result = await response.json();

    if (result.message !== "CHANGES HAVE BEEN SUBMITTED") {
      console.error(`Failed to update activity ${activityId}`);
    } else {
      console.log(`Activity ${activityId} updated successfully`);
    }
  } catch (error) {
    console.error('Error updating activity status:', error);
  }
  window.location.replace("/");
  window.location.reload(); 
};

onMounted(() => {
  // Ensure the page reloads only if needed
  if (!window.performance || window.performance.navigation.type !== window.performance.navigation.TYPE_RELOAD) {
    // Force reload if the page is not already reloaded
    window.location.reload();
  } else {
    // Allow the content to display after the page has reloaded
    nextTick(() => {
      isLoading.value = false; // Hide loading screen
    });
  }
});

</script>

<template>
    <div class="box">
 
<strong
  :style="{
    color: activity.status_id === 1 ? 'black' : 'rgb(110, 4, 4)',
    textDecoration: activity.status_id === 1 ? 'line-through' : 'none',
  }"
>
  {{ activity.activity }}
</strong>
<label>
  <input
    type="checkbox"
    :checked="activity.value?.status_id === 1"
    @change="($e) => updateActivityStatus(activity.id, $e.target.checked)"
  />
  Mark if Completed
</label>

    </div>
  </template>

<style scoped>
/* Centering the box and adding visible borders */
body, html {
  height: 100%;
  margin: 0;
}

.box {
  display: flex;
  flex-direction: column; /* Keep items in a vertical layout */
  align-items: center; /* Center items horizontally */
  justify-content: center; /* Center items vertically */
  width: 500px;
  height: 200px; /* Adjust height for proper centering */
  padding: 20px;
  border: 2px solid black; /* Visible border with black color */
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the box both horizontally and vertically */
  background-color: rgb(142, 190, 114);
}

strong {
  font-size: 18px;
  margin-bottom: 10px;
}

label {
  margin-top: 10px;
}
</style>
