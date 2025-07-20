import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore(
  "app",
  () => {
    const restMessage = ref("No REST data yet");
    const wsMessage = ref("No WebSocket data yet");

    const setRestMessage = (message: string) => {
      restMessage.value = message;
    };

    const setWsMessage = (message: string) => {
      wsMessage.value = message;
    };

    const clearStore = () => {
      restMessage.value = "No REST data yet";
      wsMessage.value = "No WebSocket data yet";
    };

    return { restMessage, wsMessage, setRestMessage, setWsMessage, clearStore };
  },
  {
    persist: true,
  }
);
