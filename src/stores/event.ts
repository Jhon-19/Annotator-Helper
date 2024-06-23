import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEventStore = defineStore(
  'event',
  () => {
    const eventTypeSet = ref<string[]>([])

    function addEventType(eventType: string) {
      eventTypeSet.value.push(eventType)
      eventTypeSet.value = eventTypeSet.value.sort(Intl.Collator().compare)
    }

    return {
      eventTypeSet,
      addEventType
    }
  },
  {
    persist: true
  }
)
