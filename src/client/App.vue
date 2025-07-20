<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-600 p-4">
      <ul class="flex space-x-4 justify-center">
        <li>
          <RouterLink to="/" class="text-white hover:text-blue-200">Home</RouterLink>
        </li>
        <li>
          <RouterLink to="/about" class="text-white hover:text-blue-200">About</RouterLink>
        </li>
      </ul>
    </nav>
    <div class="container mx-auto p-4">
      <RouterView />
    </div>
  </div>
</template>
