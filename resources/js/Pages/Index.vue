<script setup>
import { ref, watch,onMounted,nextTick } from 'vue';
import { usePage } from '@inertiajs/vue3';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FingerprintSpinner } from 'epic-spinners';

// Define reactive properties for activities, search input, and error handling
const activities = ref(usePage().props.activities || []); 
const originalActivities = ref([...activities.value]); // Store the original activities
const search = ref(''); // Default search to an empty string
const error = ref(null);
const selectedDate = ref(''); // Store the selected date
const showSpinner = ref(true);
const hasReloaded = ref(false);
const isLoading = ref(true);

// Function to handle navigation based on the selected option
const navigateTo = (event) => {
  const selectedRoute = event.target.value;
  
  if (selectedRoute) {
    window.location.href = selectedRoute;  // Redirects to the selected URL
    event.target.value = '';  
  }
};

// Navigate to /create page
const createNewTask = () => {
  window.location.href = '/create'; // Redirects to the /create page
};

// Function to filter activities based on the search term
const searchTable = (value, myArray) => {
  return myArray.filter(activity => {
    // Ensure that activity.activity exists and is a string before searching
    const activityName = activity.activity || '';  // Fallback to empty string if undefined
    return activityName.toLowerCase().includes(value.toLowerCase()); // Mimics SQL's `%like%`
  });
};

const filterByDate = (date) => {
  if (!date) return originalActivities.value; // If no date is selected, return all activities
  return originalActivities.value.filter(activity => {
    // Check if the created_date is equal to the selected date
    const createdDate = activity.created_at.split('T')[0]; // Assuming created_date is in "YYYY-MM-DDT..." format
    return createdDate === date;
  });
};

const searchActivities = () => {
  try {
    // Ensure the search and activities exist before proceeding
    if (!activities.value || !Array.isArray(activities.value)) {
      error.value = 'No activities available for search.';
      return;
    }

    // Trim any leading or trailing whitespace from the search value
    const trimmedSearch = search.value.trim(); 

    // If search is empty, reset activities to original list
    if (trimmedSearch === '') {
      activities.value = [...originalActivities.value]; // Reset to all activities
      error.value = null; // Clear any previous errors
      return;
    }

    // Log the trimmed search term for debugging
    console.log('Searching for:', trimmedSearch);

    // Filter the activities based on the trimmed search term
    const filteredActivities = searchTable(trimmedSearch, originalActivities.value);

    // Check if any activities were found
    if (filteredActivities.length === 0) {
      activities.value = []; // Clear the displayed activities if no match
      error.value = 'No activities found';
    } else {
      activities.value = filteredActivities; // Update the displayed activities
      error.value = null; // Clear any previous errors
    }
  } catch (err) {
    console.error('Error during search:', err);
    error.value = 'Error during search: ' + err.message;
  }
};

// Keyup event handler (optional for debugging)
const onKeyup = (event) => {
  const value = event.target.value;
  console.log('Keyup event value:', value);
};

// Function to hide the spinner after a delay
const hideSpinnerAfterDelay = (spinnerRef, delay = 3000) => {
  setTimeout(() => {
    spinnerRef.value = false; // Update spinner state
    postSpinner(); // Reload the page after hiding the spinner
  }, delay);
};

// Function to reload the page once
const postSpinner = () => {
  if (!hasReloaded) {
    hasReloaded = true; // Set the flag to true to prevent further reloads
    window.location.reload(); // Reload the page
  }
};

// Watch the search input to trigger the search automatically
watch(search, (newSearch) => {
  searchActivities();
});

// Watch the selected date to filter activities
watch(selectedDate, (newDate) => {
  activities.value = filterByDate(newDate); // Filter activities when the date changes
});

// Simulate fetching activities or other setup
// Simulate fetching activities or other setup
onMounted(() => {
  hideSpinnerAfterDelay(showSpinner); // Pass `showSpinner` to hide the spinner after the delay
  // Ensure the page reloads only if needed
  if (!window.performance || window.performance.navigation.type !== window.performance.navigation.TYPE_RELOAD) {
    // Force reload if the page is not already reloaded
    window.location.reload();
  } else {
    // Allow the content to display after the page has reloaded
    nextTick(() => {
      isLoading.value = false; // Hide loading screen
    });
  }}
);
</script>

<template>
  
  <div>
    <!-- Overlay for the spinner -->
    <div v-if="showSpinner" class="overlay">
      <fingerprint-spinner
        :animation-duration="1500"
        :size="64"
        color="blue"
      />
    </div>

    <!-- Main Content -->
    <div v-show="!showSpinner" >
    <!-- Top Row: Controls -->
    <div class="card card-body d-flex justify-content-between align-items-center">
    <button
    class="btn btn-primary me-3"
    @click="createNewTask" >
    +<span><i>Create new task</i></span>
  </button>
      <!-- Search Input -->
      <input
        id="search-input"
        class="form-control flex-fill me-3"
        type="text"
        placeholder="Search activities..."
        v-model="search"
        @input="searchActivities"
        @keyup="onKeyup"
      />

      <!-- Dropdown for filtering activities -->
      <select class="form-control mt-2 me-3 flex-shrink-0" @change="navigateTo($event)">
        <option value="">Filter by status</option>
        <option value="/completed">Completed Activities</option>
        <option value="/pending">Pending Activities</option>
        <option value="/paused">Paused Activities</option>
        <option value="/archieved">Archieved Activities</option>
        <option value="/today">Today's Activities</option>
        <option value="/deleted">Deleted Activities</option>
      </select>


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

    <!-- Activities List -->
    <div class="table">
    <DataTable :value="activities" responsiveLayout="scroll">
      <template #header>
        <h1>ALL ACTIVITIES</h1>
      </template>

      <Column field="activity" header="ACTIVITY">
        <template #body="slotProps">
          <a :href="`/show/${slotProps.data.id}`" 
             :class="{ 
               archieved: slotProps.data.is_archieved === 1, 
               paused: slotProps.data.is_paused === 1 
             }">
            {{ slotProps.data.activity }}
          </a>
        </template>
      </Column>

      <Column field="status_id" header="STATUS">
        <template #body="slotProps">
          <div>
            <!-- Check the status_id and display corresponding status -->
            {{ slotProps.data.status_id === 1 ? 'COMPLETED' : slotProps.data.status_id === 2 ? 'PENDING' : 'UNKNOWN' }}
          </div>
        </template>
      </Column>

      <Column field="is_archieved" header="ARCHIEVED">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.is_archieved }}
          </div>
        </template>
      </Column>

      <Column field="is_paused" header="PAUSED">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.is_paused }}
          </div>
        </template>
      </Column>
      <Column field="created_at" header="START TIME">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.created_at}}
          </div>
        </template>
      </Column>
<Column field="updated_at" header="END TIME">
  <template #body="slotProps">
    <div>
      <!-- Display the 'updated_at' only if 'status_id === 1', otherwise show nothing -->
      {{ slotProps.data.status_id === 1 ? slotProps.data.updated_at : '' }}
    </div>
  </template>
</Column>
  </DataTable>

    </div>
  </div>
</div>
  
</template>


<style scoped>
/* Flexbox alignment for the controls */
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

/* Styling for links */
.archieved {
  color: gray;
}

.paused {
  color: green;
}

a {
  color: black;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
</style>




