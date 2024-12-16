<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref, watch,onMounted,nextTick } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const activities = ref([]);
const originalActivities = ref([]);
const search = ref('');
const error = ref(null);
const isLoading = ref(true);

const pageProps = usePage().props;

if (pageProps.activities) {
  activities.value = pageProps.activities;
  originalActivities.value = [...pageProps.activities];
} else {
  console.error("Activities data is not available in page props.");
}

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
    window.location.replace('/').reload(); 
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};
const searchTable = (value, myArray) => {
  return myArray.filter(activity => {
    const activityName = activity.activity || '';
    return activityName.toLowerCase().includes(value.toLowerCase());
  });
};

const searchActivities = () => {
  try {
    if (!activities.value || !Array.isArray(activities.value)) {
      error.value = 'No activities available for search.';
      return;
    }

    const trimmedSearch = search.value.trim();

    if (trimmedSearch === '') {
      activities.value = [...originalActivities.value];
      error.value = null;
      return;
    }

    const filteredActivities = searchTable(trimmedSearch, originalActivities.value);

    if (filteredActivities.length === 0) {
      activities.value = [];
      error.value = 'No activities found';
    } else {
      activities.value = filteredActivities;
      error.value = null;
    }
  } catch (err) {
    console.error('Error during search:', err);
    error.value = 'Error during search: ' + err.message;
  }
};

// Function to archive paused activity
const archivePausedActivity = async (activityId) => {
  try {
    const response = await fetch(`/archieve/${activityId}`, {
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
      setTimeout(() => {
        archivePausedActivity(activity.id);
      }, 86400000); 
    }
  });
};

// Simulate fetching activities on mount
onMounted(() => {
  // Start monitoring paused activities
  monitorPausedActivities();
});

watch(search, () => {
  searchActivities();
});

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
   <div class="card card-body d-flex justify-content-between align-items-center">
    <!-- Search Input -->
    <input
      id="search-input"
      class="form-control"
      type="text"
      placeholder="Search Paused Activities..."
      v-model="search"
      @input="searchActivities"
      @keyup="onKeyup"
    />
  </div>
  
  <div class="table" responsiveLayout="scroll">
    <DataTable :value="activities" responsiveLayout="scroll">
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

<style scoped>

  </style>