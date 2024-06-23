<template>
  <ElConfigProvider :locale="zhCn">
    <div class="page">
      <ElContainer>
        <ElHeader><NavHeader /></ElHeader>
        <ElMain class="main">
          <RouterView />
        </ElMain>
      </ElContainer>
    </div>
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { ElConfigProvider, ElContainer, ElHeader, ElMain } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import NavHeader from './components/nav-header.vue'
import { useThemeStore } from './stores/theme'
import { ref, watchEffect } from 'vue'

const themeStore = useThemeStore()

const background = ref('white')

watchEffect(() => {
  if (themeStore.theme === 'dark') {
    background.value = 'black'
  } else if (themeStore.theme === 'light') {
    background.value = 'white'
  } else {
    background.value = 'black'
  }
})
</script>

<style scoped lang="less">
.page {
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: v-bind(background);
}

.main {
  height: 100%;
}
</style>
