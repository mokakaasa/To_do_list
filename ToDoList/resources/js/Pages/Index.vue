<script setup>
import { ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

// Define reactive properties for activities, search input, and error handling
const activities = ref(usePage().props.activities || []); 
const originalActivities = ref([...activities.value]); // Store the original activities
const search = ref(''); // Default search to an empty string
const error = ref(null);

// Function to handle navigation based on the selected option
const navigateTo = (event) => {
  const selectedRoute = event.target.value;
  
  if (selectedRoute) {
    window.location.href = selectedRoute;  // Redirects to the selected URL
    event.target.value = '';  
  }
};

// Function to filter activities based on the search term
const searchTable = (value, myArray) => {
  return myArray.filter(activity => {
    // Ensure that activity.activity exists and is a string before searching
    const activityName = activity.activity || '';  // Fallback to empty string if undefined
    return activityName.toLowerCase().includes(value.toLowerCase()); // Mimics SQL's `%like%`
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

// Watch the search input to trigger the search automatically
watch(search, (newSearch) => {
  searchActivities();
});

</script>

<template>
  <div>
    <!-- Top Row: Controls -->
    <div class="card card-body d-flex justify-content-between align-items-center">
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
    </div>

    <!-- Activities List -->
    <div class="activities-list mt-3">
      <ul v-if="activities.length > 0" class="list-group">
        <li v-for="activity in activities" :key="activity.id" class="list-group-item">
          <a :href="`/show/${activity.id}`" 
             :class="{ 
               archieved: activity.is_archieved === 1, 
               paused: activity.is_paused === 1 
             }">
            {{ activity.activity }}
          </a>
        </li>
      </ul>
      
      <!-- Error Message -->
      <p v-else class="text-danger">{{ error }}</p>
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
</style>




