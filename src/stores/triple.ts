import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTripleStore = defineStore(
  'triple',
  () => {
    const relationSet = ref<string[]>([])

    function addRelation(relation: string) {
      relationSet.value.push(relation)
      relationSet.value = relationSet.value.sort(Intl.Collator().compare)
    }

    return {
      relationSet,
      addRelation
    }
  },
  {
    persist: true
  }
)
