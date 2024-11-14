<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

const activity = usePage().props.activity;
const statusId = ref(2); // To hold the status_id value
const error = ref(null);

// Submit the status_id and is_archieved to the /revive/{id} endpoint
const handleSubmit = async () => {
  try {
    const response = await fetch(`/revive/${activity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status_id: statusId.value,  // Send status_id
      }),
    });

    const result = await response.json();
    console.log(result.message); // Display success message from the server

    // Redirect or reload the page if needed
    window.location.replace(`/show/${activity.id}`).reload();
  } catch (error) {
    console.error('Error submitting tasks:', error);
    error.value = 'An error occurred while submitting.';
  }
};
</script>

<template>
  <div class="box">
    <h3>{{ activity.activity }}</h3>
    <button class="button" @click="handleSubmit">UNARCHIEVE</button>

    <!-- Display error message if any -->
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<style scoped>
body, html {
  height: 100%;
  margin: 0;
}

.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 50px;
  padding: 20px;
  border: 2px solid black;
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: green;
}

h3 {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 18px;
  color: black;
  margin-bottom: 20px;
  position: absolute;
  left: 5px;
  top: 10px;
}

.button {
  padding: 12px 24px;
  border: 2px solid black;
  border-radius: 8px;
  cursor: pointer;
  position: absolute;
  left: 420px;
  top: 50px;
}

.button:hover {
  background-color: #45a049;
}
</style>
