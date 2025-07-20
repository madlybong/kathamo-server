import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    restMessage: "No REST data yet",
    wsMessage: "No WebSocket data yet",
  }),
  actions: {
    setRestMessage(message: string) {
      this.restMessage = message;
    },
    setWsMessage(message: string) {
      this.wsMessage = message;
    },
  },
  persist: {
    storage: localStorage, // Persist state in localStorage
  },
});
