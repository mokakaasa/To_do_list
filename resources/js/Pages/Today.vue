<script setup> 
import { ref, computed, onMounted, watch,nextTick } from 'vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { usePage } from '@inertiajs/vue3';
// import { VCard, VCardTitle, VCardText } from 'vuetify/components';



// Initialize reactive data properties
const activities = ref(usePage().props.activities || []); 
const originalActivities = ref([...activities.value]); // Store the original activities
const search = ref(''); // Default search to an empty string
const error = ref('');
const events = ref([]); // VueCal-compatible events
const selectedEvent = ref({}); // Details of the currently selected event
const showDialog = ref(false); // Toggle for event detail dialog
const selectedActivity = ref(''); // Store the currently selected activity for status update
const isLoading = ref(true);
const searchHour = ref('');

// Function to handle navigation based on the selected option
const navigateTo = (event) => {
  const selectedRoute = event.target.value;
  
  if (selectedRoute) {
    window.location.href = selectedRoute;  // Redirects to the selected URL
    event.target.value = '';  
  }
};

// Function to fetch activities from the server
const fetchActivities = async () => {
  try {
    const response = await fetch('/today', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();

    activities.value = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};

// Unified function to update activity status and handle checkbox changes
const updateActivityStatus = async (activityId, isChecked) => {
  const newStatusId = isChecked ? 1 : 2;

  // Update the local activity
  const activity = activities.value.find((a) => a.id === activityId);
  if (activity) {
    activity.status_id = newStatusId;
  }

  try {
    // Send the updated status to the server
    const response = await fetch(`/todayupdate/${activityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({statusId: newStatusId }),
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
};

const addCustomList = () => {
  const targetDiv = document.querySelector('.vuecal__flex.vuecal__cell-content');
  if (!targetDiv) return;

  // Remove existing placeholders or lists
  const noEventPlaceholder = targetDiv.querySelector('.vuecal__no-event');
  if (noEventPlaceholder) noEventPlaceholder.remove();

  const existingList = targetDiv.querySelector('ul');
  if (existingList) existingList.remove();

  // Filter activities for today
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const todayActivities = activities.value.filter((activity) => {
    const activityTime = new Date(activity.created_at);
    return activityTime >= startOfToday && activityTime <= endOfToday;
  });

  if (todayActivities.length === 0) {
    const noActivitiesMessage = document.createElement('p');
    noActivitiesMessage.textContent = 'No activities for today.';
    targetDiv.appendChild(noActivitiesMessage);
    return;
  }

  // Create the list
  const ulElement = document.createElement('ul');
  todayActivities.forEach((activity) => {
    const activityTime = new Date(activity.created_at);
    const liElement = document.createElement('li');
    liElement.classList.add('time-slot');

    // Populate the list item with checkbox reflecting activity.status_id
    liElement.innerHTML = `
      <strong>${activityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>
      <div
        class="vuecal__event-title"
        style="color: ${activity.status_id === 1 ? 'black' : 'rgb(110, 4, 4)'}; 
               text-decoration: ${activity.status_id === 1 ? 'line-through' : 'none'};">
        ${activity.activity}
      </div>
      <label>
        <input
          type="checkbox" 
          ${activity.status_id === 1 ? 'checked' : ''}
          data-id="${activity.id}"
            @change="($e) => updateActivityStatus(activity.id, $e.target.checked)"
        />
        Mark if Completed
      </label>
    `;

    // Attach event listener for checkbox change
    const checkbox = liElement.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      const newStatusId = isChecked ? 1 : 2;

      // Update local activity state
      activity.status_id = newStatusId;

      // Sync with the server
      updateActivityStatus(activity.id, newStatusId);

      // Reflect the changes visually
      const titleElement = liElement.querySelector('.vuecal__event-title');
      titleElement.style.color = isChecked ? 'black' : 'rgb(110, 4, 4)';
      titleElement.style.textDecoration = isChecked ? 'line-through' : 'none';
    });


    ulElement.appendChild(liElement);
  });

  targetDiv.appendChild(ulElement);
};

// Transform activities into VueCal-compatible events
const transformActivitiesToEvents = () => {
  if (!Array.isArray(activities.value)) return; // Guard clause

  events.value = activities.value.map(activity => {
    if (!activity.id || !activity.activity) {
      console.error('Invalid activity data', activity);
      return {}; // Return a fallback event object if data is invalid
    }
    
    return {
      id: activity.id,
      title: activity.activity, 
      status_id: activity.status_id,
      color: activity.status_id === 1 ? 'black' : 'rgb(110, 4, 4)', 
    };
  });
};

// Filter activities based on the selected hour
const filteredTime = (hour) => {
  if (!hour) return originalActivities.value;

  // const hourToSearch = Number(searchHour.value);

  return originalActivities.value.filter((activity) => {
    const activityHour = new Date(activity.created_at).getHours();
    return activityHour === hour;
  });
};

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



const selectedDate = ref(new Date()); // Default to today

// Format selected date as "Week <number> (Month Year)"
const formattedDate = computed(() => {
  const date = selectedDate.value;

  if (!date) return '';

  // Calculate week number
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear + 86400000) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  // Get month and year
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return `Week ${weekNumber} (${month} ${year})`;
});

// Update selected date on date change
const onDateChange = (date) => {
  selectedDate.value = new Date(date);
};



// Function to format disabled dates for VueCal
const formatDate = (date) => date.toISOString().split('T')[0];

// Disable dates logic: 30 days before and after today
const disableDays = computed(() => {
  const today = new Date();
  const disabledDates = [];

  for (let i = -30; i <= 30; i++) {
    if (i === 0) continue; // Skip today
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    disabledDates.push(formatDate(date));
  }

  return disabledDates;
});

const updateActivityStatusHandler = (event) => {
  if (!event || !event.id) {
    console.error("Invalid event data passed to updateActivityStatusHandler");
    return;
  }

  const newStatusId = event.status_id === 1 ? 2 : 1; // Toggle status
  updateActivityStatus(event.id, newStatusId);
};



// Watch for activities change and update events accordingly
watch(activities, (newActivities) => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const activityId = checkbox.dataset.id;
    const activity = newActivities.find((a) => a.id == activityId);
    if (activity) {
      checkbox.checked = activity.status_id === 1;
    }
  });
});

// Watch the search input to trigger the search automatically
watch(search, (newSearch) => {
  searchActivities();
});

// Watch the selected date to filter activities
watch(searchHour, (newHour) => {
  activities.value = filteredTime(newHour); // Filter activities when the date changes
});

onMounted(() => {
  
  fetchActivities();

    // Transform activities to events
    transformActivitiesToEvents();

  addCustomList();

    // Update checkboxes based on status_id after fetch
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const activityId = checkbox.dataset.id;
    const activity = activities.value.find((a) => a.id == activityId);
    if (activity) {
      checkbox.checked = activity.status_id === 1; // Set checkbox to checked if status_id is 1
    }
  });

    // Disable the "Next" button
    const nextButton = document.querySelector('.vuecal__arrow--next');
  if (nextButton) {
    nextButton.disabled = true;
  }

  // Disable the "Previous" button
  const prevButton = document.querySelector('.vuecal__arrow--prev');
  if (prevButton) {
    prevButton.disabled = true;
  }
  const dayButton = document.querySelector('.vuecal__view-btn[aria-label="Day view"]');
  if (dayButton) {
    dayButton.style.display = 'none'; // Hide the button
  }

  
  this.buttonLabel = "Today's Activities"
});
const onPreviewChange = (newDate) => {
  // Prevent navigation by forcing the calendar back to today
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  if (newDate !== formattedToday) {
    return false; // Block the navigation
  }
};
// Select the <ul> element using its attributes
  const unwantedUl = document.querySelector('ul[data-v-133ad230]');

// Check if the <ul> exists before attempting to remove it
if (unwantedUl) {
    unwantedUl.remove();
}
// Create a MutationObserver to watch the body for changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        const unwantedUl = document.querySelector('ul[data-v-133ad230]');
        if (unwantedUl) {
            unwantedUl.remove();
            observer.disconnect(); // Stop observing after removal
        }
    });

  //   if (!window.performance || window.performance.navigation.type !== window.performance.navigation.TYPE_RELOAD) {
  //   // Force reload if the page is not already reloaded
  //   window.location.reload();
  // } else {
  //   // Allow the content to display after the page has reloaded
  //   nextTick(() => {
  //     isLoading.value = false; // Hide loading screen
  //   });
  // }
});

// Start observing the <body> for child changes
observer.observe(document.body, { childList: true, subtree: true });
window.onload = () => {
    const dayButton = document.querySelector('button.vuecal__view-btn--active');
    if (dayButton) {
        dayButton.textContent = "Today's Activities";
    }
};


</script>


<template>

<div class="card card-body d-flex justify-content-between align-items-center">

<!-- Input to search for activities by hour -->
<div class="form-group me-3">
<label for="hour">Search by Hour:</label>
<input
  id="hour"
  type="number"
  v-model="searchHour"
  placeholder="Enter hour (0-23)"
  min="0"
  max="23"
/>
</div>


<input
    id="search-input"
    class="form-control flex-fill me-3"
    type="text"
    placeholder="Search activities..."
    v-model="search"
    @input="searchActivities"
    @keyup="onKeyup"
  />
</div>

<div class="activities-list">
    <ul>
      <li v-for="activity in activities" :key="activity.id">
        <strong>{{ activity.activity }}</strong>
        <label>
          <input type="checkbox" />
          Mark if Completed
        </label>
      </li>
    </ul>
  </div>

  <vue-cal
    :selected-date="selectedDate"
    :events="events"
    click-to-navigate
    :disable-views="['years', 'year', 'week', 'month']"
     @event-click="updateActivityStatusHandler"
    @date-change="onPreviewChange"
    :selected-event="selectedActivity"
    :time="false"
  />

<div>
    <ul>
      <li v-for="activity in activities" :key="activity.id">
        <strong>{{ activity.activity }}</strong>
        <label>
          <input
            type="checkbox"
            :checked="activity.status_id === 1"
            @change="($e) => updateActivityStatus(activity.id, $e.target.checked)"
          />
          Mark if Completed
        </label>
      </li>
    </ul>
  </div>

</template>


<style scoped>
.completed {
  text-decoration: line-through;
  text-decoration-color: black;
  color: black;
}

input[type="checkbox"]:checked + .vuecal__event-title {
  text-decoration: line-through;
  text-decoration-color: black;
  color: black;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

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
  margin-top: 1rem; /* Adds spacing from the search input section */
  margin-bottom: 1rem; /* Adds spacing from the calendar */
}
</style>