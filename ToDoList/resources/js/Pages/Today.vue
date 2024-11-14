<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref, onMounted, nextTick } from 'vue';

const activities = usePage().props.activities;
const error = ref(null);

const updateActivity = async (activity, event) => {
  // console.log(event.currentTarget.checked);
  const activityId = activity.id;
  const statusId = event.currentTarget.checked ? 1 : 2;

  try {
    const response = await fetch('/todayupdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        activityId: activityId,  // Correct variable names
        statusId: statusId,      // Correct variable names
      }),
    });
    const result = await response.json();
    activities.value = result;
    console.log(result); // Success message from the server
  } catch (error) {
    console.error('Error submitting tasks:', error);
  }
};


const fetchActivity = async () => {

  try {
    const response = await fetch('/today', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    activities.value = result;
    console.log(result); // Success message from the server
  } catch (error) {
    console.error('Error submitting tasks:', error);
  }
};

onMounted(() => {
  nextTick(() => {
    fetchActivity()
  }) // Call the fetchActivity function when the component mounts
});



</script>

<template>
  <h1>Today's Activities</h1>

  <div id="listing">
    <ul>
      <li v-for="(activity, index) in activities" :key="activity.id">
        <input type="checkbox" :id="'status'+index"  :checked="activity.status_id === 1"  @change="updateActivity(activity, $event)">
        <h3>{{ activity.activity }}</h3>
      </li>
    </ul>
  </div>
</template>

<style scoped>
body {
  background-image: url("/home/ascer/Desktop/ToDoList/notebook.jpg");
  background-size: 70%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
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
