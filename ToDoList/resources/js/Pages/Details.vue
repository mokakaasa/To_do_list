<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref, onMounted, nextTick } from 'vue';

const activity = usePage().props.activity;
const error = ref(null);

const fetchActivity = async () => {

  try {
    const response = await fetch(`/detail/${activity.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    activity.value = result;
    console.log(result); // Success message from the server
  } catch (error) {
    // console.error('Error submitting tasks:', error);
  }
};

onMounted(() => {
  nextTick(() => {
    fetchActivity()
  }) // Call the fetchActivity function when the component mounts
});



</script>

<template>
  <div class="box">
    <h3>{{ activity.activity }}</h3>

    <a :href="`/edit/${activity.id}`">
      <button class="button">EDIT</button>
    </a>
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
  align-items: center; /* Center items horizontally */
  justify-content: center; /* Center items vertically */
  width: 300px;
  height:50px;
  padding: 20px;
  border: 2px solid black; /* Visible border with black color */
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the box both horizontally and vertically */
  background-color: rgb(142, 190, 114);
}

/* Styling for the activity (h3) */
h3 {
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 18px;
  color: black;
  margin-bottom: 20px;
  position: absolute;
  left:5px;
  top:10px; 
}

/* Styling for the button */
.button {
 
  padding: 12px 24px;
  border: 2px solid black; /* Border for the button */
  border-radius: 8px;
  cursor: pointer;
  position: absolute;
  left:260px;
  top:50px; 
}

/* Hover effect for the button */
.button:hover {
  background-color: #45a049; /* Darker green on hover */
}
</style>
