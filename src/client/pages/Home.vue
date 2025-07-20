<script setup lang="ts">
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();

async function fetchHello() {
    try {
        const response = await fetch('/api/hello');
        const data = await response.json();
        appStore.setRestMessage(data.message);
    } catch (error) {
        appStore.setRestMessage('Error fetching REST data');
    }
}

async function fetchLogin() {
    try {
        const response = await fetch('/api/auth/login', { method: 'POST' });
        const data = await response.json();
        appStore.setRestMessage(data.message);
    } catch (error) {
        appStore.setRestMessage('Error fetching login data');
    }
}

async function fetchUser() {
    try {
        const response = await fetch('/api/users/1');
        const data = await response.json();
        appStore.setRestMessage(data.message);
    } catch (error) {
        appStore.setRestMessage('Error fetching user data');
    }
}

async function fetchContent() {
    try {
        const response = await fetch('/api/content/1');
        const data = await response.json();
        appStore.setRestMessage(data.message);
    } catch (error) {
        appStore.setRestMessage('Error fetching content data');
    }
}

async function connectWebSocket() {
    try {
        const ws = new WebSocket('ws://' + window.location.host + '/ws');
        ws.onmessage = (event) => {
            appStore.setWsMessage(event.data);
        };
        ws.onopen = () => {
            ws.send('Hello from client!');
        };
        ws.onerror = () => {
            appStore.setWsMessage('WebSocket error');
        };
    } catch (error) {
        appStore.setWsMessage('Error connecting to WebSocket');
    }
}
</script>
<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4">Home</h1>
        <p class="mb-4">REST API Response: {{ appStore.restMessage }}</p>
        <p class="mb-4">WebSocket Message: {{ appStore.wsMessage }}</p>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="fetchHello">
            Fetch Hello
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4" @click="fetchLogin">
            Fetch Login
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4" @click="fetchUser">
            Fetch User 1
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4" @click="fetchContent">
            Fetch Content 1
        </button>
        <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4" @click="connectWebSocket">
            Connect WebSocket
        </button>
    </div>
</template>
