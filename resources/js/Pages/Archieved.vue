<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref, watch,onMounted,nextTick } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


const activities = ref([]);
const originalActivities = ref([]);
const search = ref('');
const error = ref(null);
const selectedDate = ref(''); // Store the selected date
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
    console.log(result.message);
    window.location.replace('/'); 
    window.location.reload();
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
const filterByDate = (date) => {
  if (!date) return originalActivities.value; // If no date is selected, return all activities
  return originalActivities.value.filter(activity => {
    // Check if the created_date is equal to the selected date
    const createdDate = activity.created_at.split('T')[0]; // Assuming created_date is in "YYYY-MM-DDT..." format
    return createdDate === date;
  });
};

watch(search, () => {
  searchActivities();
});

watch(selectedDate, (newDate) => {
  activities.value = filterByDate(newDate); // Filter activities when the date changes
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
      placeholder="Search Archieved Activities..."
      v-model="search"
      @input="searchActivities"
      @keyup="onKeyup"
    />

    <div class="form-group me-3">
        <label for="date-picker" class="form-label">Filter by Date</label>
        <input
          id="date-picker"
          type="date"
          class="form-control"
          v-model="selectedDate"
        />
      </div>

  </div>

  <div class="table" responsiveLayout="scroll">
    <DataTable :value="activities"  responsiveLayout="scroll">
      <template #header>
        <h1>ARCHIEVED ACTIVITIES</h1>
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
            <a :href='`/unarchieve/${slotProps.data.id}`'>
              <button>UNARCHIEVE</button>
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
.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}


/* Adjust input control widths */
.form-control {
  width: auto;
  max-width: 300px; /* Optional: Limit width */
}

.flex-fill {
  flex: 1; /* Allow search input to take up remaining space */
}

/* Spacing between controls and activities */
.activities-list {
  margin-top: 1rem;
}
  </style>