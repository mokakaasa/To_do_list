<script setup>

import { usePage } from '@inertiajs/vue3';
import { ref, watch,onMounted,nextTick } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


const isLoading = ref(true);
// Define reactive properties for activities, search input, and error handling
const activity = usePage().props.activity;

const deleteActivity = async (activity) => {
  if (!activity || !activity.id) {
    console.error('Invalid activity provided');
    return;
  }

  try {
    const response = await fetch(`/delete/${activity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }

    const result = await response.json();
    console.log(result.message); // Success message from server

    // Redirect to /deleted after successful deletion
    window.location.replace('/');
    window.location.reload(); 
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

const startActivity = async (activity) => {
  if (!activity || !activity.id) {
    console.error('Invalid activity provided');
    return;
  }

  try {
    const response = await fetch(`/start/${activity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }

    const result = await response.json();
    console.log(result.message); // Success message from server

    // Redirect to /deleted after successful deletion
    window.location.replace('/');
    window.location.reload(); 
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

// Function to archive paused activity
const archivePausedActivity = async (activityId) => {
  try {
    const response = await fetch(`/archive/${activityId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to archive activity");
    }

    console.log(`Activity ${activityId} archived successfully`);
    // Update local state if needed
    const activity = activities.value.find((a) => a.id === activityId);
    if (activity) {
      activity.is_archieved = 1;
      activity.is_paused = 0; // Optional, reset paused state
    }
  } catch (error) {
    console.error(error.message);
  }
};

// Monitor paused activities and schedule archiving
const monitorPausedActivities = () => {
  activities.value.forEach((activity) => {
    if (activity.is_paused === 1) {
      // Schedule archiving after 10 minutes
      setTimeout(() => {
        archivePausedActivity(activity.id);
      }, 86400000); // 10 minutes in milliseconds
    }
  });
};

// Simulate fetching activities on mount
onMounted(() => {
  // Start monitoring paused activities
  monitorPausedActivities();

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
  <div class="table" responsiveLayout="scroll">
    <DataTable :value="[activity]" responsiveLayout="scroll">
      <template #header>
        <h1>PAUSED ACTIVITIES</h1>
      </template>

      <Column field="activity" header="ACTIVITY">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.activity }}
          </div>
        </template>
      </Column>

      <Column header="ACTIONS">
        <template #body="slotProps">
          <td>
            <a :href='`/edit/${slotProps.data.id}`'>
              <button>CHANGE ACTIVITY NAME</button>
            </a>
          </td>
          <td>
            <a :href='`/updatestatus/${slotProps.data.id}`'>
              <button>CHANGE ACTIVITY STATUS</button>
            </a>
          </td>

          <td>
            <button @click="startActivity(slotProps.data)">START</button>
          </td>
           
          <td>
          <a :href='`/archieve/${slotProps.data.id}`'>
            <button>ARCHIEVE</button>
          </a>
          </td>
          <td>
            <button @click="deleteActivity(slotProps.data)">DELETE</button>
          </td>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped></style>