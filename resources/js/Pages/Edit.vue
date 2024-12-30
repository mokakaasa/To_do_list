<script setup>
import { ref, onMounted, nextTick,watchEffect } from 'vue'
import { usePage } from '@inertiajs/vue3';

const isLoading = ref(true);

const activity = usePage().props.activity;
const errorMessage = ref('');
const successMessage = ref('');

// Reactive reference for the updated activity name
const updatedActivityName = ref('');

watchEffect(() => {
  if (activity.value) {
    updatedActivityName.value = activity.value.activity;
  }
});

const handleSubmit = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // Send data to the backend using fetch or Axios
    const response = await fetch(`/updatename/${activity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activity: updatedActivityName.value,
      }),
    });

    const result = await response.json();

   if(response.ok){
    successMessage.value = result.message;
    window.location.replace(`/show/${activity.id}`).reload(); 

   // Redirect if redirectUrl is provided
   if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } else {
      errorMessage.value = result.message;
   }
   
  } catch (error) {
    errorMessage.value = 'TOO SHORT OR EMPTY TO BE UPDATED!!!!!';
    console.error('Error submitting tasks:', error);
  }
}

// Mount logic to handle initial rendering
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
    <h1>Edit Activity</h1>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Display success message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    
    <div class="activity">
      <label for="activity-name">{{ activity.activity }}</label>
      <input
        id="activity-name"
        type="text"
        v-model="updatedActivityName"
        placeholder="Edit Activity name"
      />
    </div>

    <button class="button" @click="handleSubmit">Save</button>
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
  flex-direction: column;
  align-items: flex-end; /* Center items horizontally */
  justify-content: flex-end; /* Center items vertically */
  width: 500px;
  height:100px;
  padding: 20px;
  border: 2px solid black; /* Visible border with black color */
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the box both horizontally and vertically */
  background-color: rgb(142, 190, 114);
}

h1 {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 18px;
  color: black;
  margin-bottom: 20px;
  position: absolute;
  left:200px;
  top:10px; 
}

.activity{
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 18px;
  color: black;
  margin-bottom: 20px;
  position: absolute;
  left:5px;
  top:60px;  
}

.button {
  padding: 12px 24px;
 
  border: 2px solid black;
  border-radius: 8px;
  cursor: pointer;
  width: 20%; /* Make buttons fill the width of the box */
  box-sizing: border-box;
  position: absolute; /* Position the button absolutely inside the .box */
  bottom: 40px; /* Distance from the bottom of the .box */
  right: 5px;  /* Distance from the right of the .box */
}
/* Hover effect for the button */
.button:hover {
  background-color: #45a049; /* Darker green on hover */
}

</style>