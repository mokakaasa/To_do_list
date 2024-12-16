<script setup>
import { usePage } from '@inertiajs/vue3';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { ref, onMounted, nextTick } from 'vue';


const isLoading = ref(true);

// Retrieve the activity data
const { activities } = usePage().props;

// Delete an activity by ID
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
    <DataTable :value="activities" responsiveLayout="scroll">
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
          <button @click="startActivity(slotProps.data)">START</button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>


<style scoped></style>