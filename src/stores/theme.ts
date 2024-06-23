import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('auto')

  function setCurrentTheme(val: string) {
    theme.value = val
  }

  return {
    theme,
    setCurrentTheme
  }
})
