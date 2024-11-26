<script setup>
import { usePage } from '@inertiajs/vue3';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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
</script>


<template>
  <div class="table">
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