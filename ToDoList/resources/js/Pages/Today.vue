<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { usePage } from '@inertiajs/vue3';
import { VCard, VCardTitle, VCardText } from 'vuetify/components';



// Initialize reactive data properties
const activities = ref(usePage().props.activities || []);
const events = ref([]); // VueCal-compatible events
const selectedEvent = ref({}); // Details of the currently selected event
const showDialog = ref(false); // Toggle for event detail dialog
const selectedActivity = ref(null); // Store the currently selected activity for status update


// Function to fetch activities from the server
const fetchActivities = async () => {
  try {
    const response = await fetch('/today', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();

    activities.value = Array.isArray(result) ? result : [];
    updateEvents();
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};
// const todayUpdate = async (activity,event) => {
//   const tasks = document.querySelector('#textarea').value.replaceAll('• ','').split("\n"); // Extract the plain text tasks from the HTML
//   const status_id = checkboxesState.value.map((checked) => (checked ? 1 : 2)); // Map checked boxes to status_ids (1 = completed, 2 = pending, etc.)

//   try {
//     // Send data to the backend using fetch or Axios
//     const response = await fetch(`/todayUpdate/${activity.id}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         tasks: tasks,
//         status_id: status_id, // Send the checkbox states
//       }),
//     });

//     const result = await response.json();
//     console.log(result.message); // Success message from the server
//   } catch (error) {
//     console.error('Error submitting tasks:', error);
//   }
//   window.location.replace(`/show/${activity.id}`).reload(); 
// }
const addCustomList = () => {
  const targetDiv = document.querySelector('.vuecal__flex.vuecal__cell-content');
  if (!targetDiv) return;

  // Remove the "No Event" placeholder if it exists
  const noEventPlaceholder = targetDiv.querySelector('.vuecal__no-event');
  if (noEventPlaceholder) {
    noEventPlaceholder.remove();
  }

  // Remove any existing list
  const existingList = targetDiv.querySelector('ul');
  if (existingList) existingList.remove();

  // Get the start and end of today (midnight to 23:59:59)
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  // Filter activities for today only
  const todayActivities = activities.value.filter((activity) => {
    const activityTime = new Date(activity.created_at);
    return activityTime >= startOfToday && activityTime <= endOfToday;
  });

  if (todayActivities.length === 0) {
    // If no activities for today, optionally display a "No Activities" message
    const noActivitiesMessage = document.createElement('p');
    noActivitiesMessage.textContent = 'No activities for today.';
    targetDiv.appendChild(noActivitiesMessage);
    return;
  }

  // Create a list of time slots with activities
  const ulElement = document.createElement('ul');
  todayActivities.forEach((activity) => {
    const activityTime = new Date(activity.created_at);
    const hour = activityTime.getHours();

    // Create a list item for this activity
    const liElement = document.createElement('li');
    liElement.classList.add('time-slot');
    liElement.setAttribute('data-hour', hour);

    liElement.innerHTML = `
      <strong>${activityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br>
      <div class="vuecal__event-title" style=" color: rgb(110, 4, 4);">${activity.activity}</div>`;

       // Add click event listener for custom behavior
       liElement.addEventListener('click', () => {
      alert(`Activity Details:\n\nTime: ${activityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nActivity: ${activity.activity}`);
    });

    // Append the activity to the list
    ulElement.appendChild(liElement);
  });

  // Append the list to the target div
  targetDiv.appendChild(ulElement);
};


// Watch for activities change and update events accordingly
watch(activities, () => {
  addCustomList();
});


// const onActivityClick = (activity) => {
//   selectedActivity.value = activity;
//   selectedEvent.value = {
//     title: activity.activity,
//     id: activity.id,
//     contentFull: activity,
//   };
//   showDialog.value = true;
// };
// Function to handle event clicks in VueCal
// const onEventClick = (event,e) => {
//   const activity = activities.value.find(activity => activity.id === event.id);
//   if (activity) {
//     selectedActivity.value = activity;
//     selectedEvent.value = event;
//     showDialog.value = true;

//     e.stopPropagation()
//   }
// };

const handleEventClick = (event) => {
    selectedEvent.value = event;
    showDialog.value = true;
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
// const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours

// // Function to get the activity for a specific hour
// const getActivityForHour = (hour) => {
//   return activities.find(activity => parseInt(activity.time.split(':')[0]) === hour);
// }

// // Function to check if the current hour is the hour in question
// const isCurrentHour = (hour) => {
//   const currentHour = new Date().getHours();
//   return currentHour === hour;
// }
// Fetch activities on component mount
onMounted(() => {
  fetchActivities();
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

  addCustomList();
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
  <!-- <h1>Today's Activities</h1> -->
  <ul>
      <li v-for="activity in activities" :key="activity.id">
        <h3>{{ activity.activity }}</h3>
      </li>
    </ul>


  <!-- <div id="listing">
  <ul>
    <li v-for="(activity, index) in activities" :key="activity.id">
     
      <h3 @click="onActivityClick(activity)">{{ activity.activity }}</h3>
    </li>
  </ul>
</div> -->

  <vue-cal
    :selected-date="selectedDate"
    :events="events"
    click-to-navigate
    :disable-views="['years', 'year', 'week', 'month']"
    @event-click="handleEventClick"
    @date-change="onPreviewChange"
    :selected-event="selectedActivity"
    :time="false"

    
  />

  <div :class="{ 'vuecal__time-cell-line': true, hours: !minutes }">
      <strong v-if="!minutes" style="font-size: 15px">{{ hours }}</strong>
      <span v-else style="font-size: 11px">{{ minutes }}</span>
    </div>

  <!-- Dialog for Event Details -->
  <v-dialog v-model="showDialog">
    <v-card>
      <v-card-title>
        <span>{{ selectedActivity.activity }}</span>
      </v-card-title>
      <v-card-text>
        <!-- <div>
            <input
              type="checkbox"
              :checked="selectedActivity?.status_id === 1"
              @change="todayUpdate($event.target.checked ? 1 : 2)"
            />
        </div>
        <p :class="{ completed: selectedActivity?.status_id === 1 }">
          {{ selectedActivity?.activity }}
        </p> -->
      </v-card-text>
    </v-card>
  </v-dialog>


</template>


<style scoped>
body,
html {
  height: 100%;
  margin: 0;
}

h1 {
  position: absolute;
  left: 500px;
}

#listing {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 430px;
  top: 250px;


}

#listing>ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  align-self: flex-start;
  transform-origin: 0 0;
  rotate: -38deg;
  display: inline-block;
}

#listing>ul li h3 {
  display: inline-block;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 18px;
  color: rgb(110, 4, 4);
  width: 270px;
}

#listing ul li input[type="checkbox"]:checked+h3 {
  text-decoration: line-through;
  text-decoration-color: black;
  color: black;
}
</style>