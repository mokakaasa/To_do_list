<script setup>

import { usePage } from '@inertiajs/vue3';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


// Define reactive properties for activities, search input, and error handling
const activity = usePage().props.activity;

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
    console.log(result.message); // Success message from server

    // Redirect to /deleted after successful deletion
    window.location.replace('/');
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

const startActivity = async (activity) => {
  if (!activity || !activity.id) {
    console.error('Invalid activity provided');
    return;
  }

  try {
    const response = await fetch(`/start/${activity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }

    const result = await response.json();
    console.log(result.message); // Success message from server

    // Redirect to /deleted after successful deletion
    window.location.replace('/');
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

</script>


<template>
  <div class="table">
    <DataTable :value="[activity]" responsiveLayout="scroll">
      <template #header>
        <h1>PAUSED ACTIVITIES</h1>
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
            <a :href='`/detail/${slotProps.data.id}`'>
              <button>EDIT</button>
            </a>
          </td>

          <td>
            <button @click="startActivity(slotProps.data)">START</button>
          </td>
           
          <td>
          <a :href='`/archieve/${slotProps.data.id}`'>
            <button>ARCHIEVE</button>
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

<style scoped></style>