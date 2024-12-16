<script setup>

import { usePage } from '@inertiajs/vue3';
import { ref, watch,onMounted,nextTick } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


const isLoading = ref(true);
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
    window.location.reload(); 
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

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
  <div class="table" responsiveLayout="scroll">
    <DataTable :value="[activity]" responsiveLayout="scroll">
      <template #header>
        <h1>COMPLETED ACTIVITIES</h1>
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
            <a :href='`/edit/${slotProps.data.id}`'>
              <button>CHANGE ACTIVITY NAME</button>
            </a>
          </td>
          <td>
            <a :href='`/updatestatus/${slotProps.data.id}`'>
              <button>CHANGE ACTIVITY STATUS</button>
            </a>
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