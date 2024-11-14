<script setup>
import { usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

// Get activities from Inertia's page props
const activities = usePage().props.activities;

</script>

<template>
  <h1>All Activities</h1>

  <!-- Completed Activities List -->
 <ul class="activity-list">

    <li v-for="activity in activities" :key="activity.id" >
      {{ activity.activity }}
    </li>
  </ul>

</template>

<style>
.activity-list {
  margin-top: 10px;
}

</style>
