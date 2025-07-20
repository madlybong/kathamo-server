<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4">About</h1>
        <p class="mb-4">This is the About page of the Vue 3 app with Bun server.</p>
        <p>State is persisted using Pinia: {{ appStore.restMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
</script>