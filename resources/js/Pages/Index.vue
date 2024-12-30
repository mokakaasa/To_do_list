<script setup>
import { ref, watch,onMounted,nextTick,computed } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FingerprintSpinner } from 'epic-spinners';
import { DateTime } from 'luxon';
import { PaginationBar } from 'v-page'


const meta  =  ref(usePage().props.activities.meta);
// Define reactive properties for activities, search input, and error handling
const activities = ref(usePage().props.activities?.data || []); 
const originalActivities = ref([...activities.value]); // Store the original activities
const search = ref(''); // Default search to an empty string
const error = ref(null);
const selectedDate = ref(''); // Store the selected date
const showSpinner = ref(true);
const hasReloaded = ref(false);
const isLoading = ref(true);
const pageNumber = ref(1);
const totalRow = ref(15);


// Get the flash message from the page props
const flash = usePage().props.flash || {};  // Default to an empty object if flash is undefined

// Computed properties for error and success messages
const errorMessage = computed(() => flash.error || null);
const successMessage = computed(() => flash.success || null);

// Function to handle navigation based on the selected option
const navigateTo = (event) => {
  const selectedRoute = event.target.value; 
  
  if (selectedRoute) {
    window.location.href = selectedRoute;  // Redirects to the selected URL
    event.target.value = '';  
  }
};

const formatISO =(date) => {
  if (!date) return ''; // Handle null or undefined dates
  return DateTime.fromISO(date).toFormat("yyyy-MM-dd'T'HH:mm:ss"); // Convert to ISO format
};

// Navigate to /create page
const createNewTask = () => {
  window.location.href = '/create'; // Redirects to the /create page
};

const paginatedActivities = async (pageNumber,perPage) => {
  // router.get(`/?page=${pageNumber}`)
//   try {
//     const response = await fetch(`/?page=${pageNumber}`, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json',  },
//     });
//     const result = await response.json();
//     console.log(result)

//     activities.value = Array.isArray(result) ? result : [];
//     const page = result.pageNumber;
//     const itemsPerPage = result.totalRow;
//     const total = result.totalPages;
// } 
// catch (error) {
//     console.error('Error fetching activities:', error);
//   }
};

const filterByDate = (date) => {
  if (!date) return originalActivities.value; // If no date is selected, return all activities
  return originalActivities.value.filter(activity => {
    // Check if the created_date is equal to the selected date
    const createdDate = activity.created_at.split('T')[0]; // Assuming created_date is in "YYYY-MM-DDT..." format
    return createdDate === date;
  });
};

// Function to filter activities based on the search term
const searchTable = (value, myArray) => {
  return myArray.filter(activity => {
    // Ensure that activity.activity exists and is a string before searching
    const activityName = activity.activity || '';  // Fallback to empty string if undefined
    return activityName.toLowerCase().includes(value.toLowerCase()); // Mimics SQL's `%like%`
  });
};

const searchActivities = async () => {
  try {
    if (!search.value.trim()) {
      // Reset activities if search is empty
      activities.value = await fetchActivities('', pageNumber.value, totalRow.value,false);
      error.value=null;
      return;
    }

    console.log('Searching for:', search.value);

    const allMatchingActivities = await fetchActivities(search.value.trim(), 1, totalRow.value, true);

    if (allMatchingActivities.length === 0) {
      activities.value = [];
      error.value = 'No activities found';
    } else {
      activities.value = allMatchingActivities;
      error.value = null;
    }
  } catch (err) {
    console.error('Error during search:', err);
    error.value = 'Error during search: ' + err.message;
  }
};

const fetchActivities = async (searchTerm = '', page = 1, itemsPerPage = 15, allPages = false) => {
  try {
    let aggregatedResults = [];
    let currentPage = page;
    let lastPage = null; // Initialize lastPage for the loop

    do {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        page: currentPage, // Include page only if fetching all pages
        itemsPerPage: itemsPerPage, // Skip pagination if fetching all
      }).toString();

      const response = await fetch(`/searchall?${queryParams}`);
      const result = await response.json();

      if (response.ok) {
        aggregatedResults = aggregatedResults.concat(result.data || []);
        currentPage++;
        lastPage = result.meta ? result.meta.last_page : 1; // Update lastPage from response
        if (!allPages)  return aggregatedResults;
      } else {
        throw new Error(result.error || 'Failed to fetch activities.');
      }
    } while (allPages && currentPage <= lastPage); 

    return aggregatedResults;
  } catch (err) {
    console.error('Error fetching activities:', err);
    throw new Error('An error occurred while fetching activities: ' + err.message);
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


const paginationChange = (page) => {
  
  if(meta.value.current_page == page.pageNumber && meta.value.per_page == page.pageSize) {
    console.log(meta.value.current_page, page.pageNumber)
    console.log('Not reloading')
  } else {
    // console.log('Reloading')
    router.get(`/?page=${page.pageNumber}&per_page=${page.pageSize}`)
  }
  
}

const showPagination = computed(() => {
      return !search.value.trim(); // Show pagination only if search is empty
    });
    
// Watch the search input to trigger the search automatically
watch(search, (newSearch) => {
  searchActivities();
});

// Watch the selected date to filter activities
watch(selectedDate, (newDate) => {
  activities.value = filterByDate(newDate); // Filter activities when the date changes
});

// watch(pageNumber, (newPageNumber) => {
//   paginatedActivities(newPageNumber);
// });


// Simulate fetching activities or other setup
// Simulate fetching activities or other setup
onMounted(() => {
  // paginatedActivities(pageNumber)
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
    <DataTable 
    :value="activities" responsiveLayout="scroll">
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
      
      <Column field="is_deleted" header="DELETED">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.is_deleted }}
          </div>
        </template>
      </Column>

      <Column field="created_at" header="START TIME">
        <template #body="slotProps">
          <div>
            {{formatISO(slotProps.data.created_at)}}
          </div>
        </template>
      </Column>
<Column field="updated_at" header="END TIME">
  <template #body="slotProps">
    <div>
      <!-- Display the 'updated_at' only if 'status_id === 1', otherwise show nothing -->
      {{ slotProps.data.status_id === 1 ? formatISO(slotProps.data.updated_at) : '' }}
    </div>
  </template>
</Column>

    <template #footer>
    <PaginationBar
    v-if="showPagination"
    :modelValue="meta.current_page"
    :total-row="meta.total"
    :page-size="meta.per_page"
    @change="paginationChange"
      />
    </template>
  </DataTable>

    </div>
  </div>
</div>

<!-- <VueTailwindPagination :current="currentPage" :total="total" :per-page="perPage" @page-changed="current = $event"/> -->


<div v-if="errorMessage" class="alert alert-danger">
  {{ errorMessage }}
</div>
<div v-if="successMessage" class="alert alert-success">
  {{ successMessage }}
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




