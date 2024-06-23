<template>
  <div class="nav-header-container">
    <ElRow justify="space-around">
      <ElButtonGroup>
        <ElButton class="nav-button" @click="goToTriple">三元组标注</ElButton>
        <ElButton :icon="themeIcon" @click="toggleDark()" circle />
        <ElButton class="nav-button" @click="goToEvent">事件标注</ElButton>
      </ElButtonGroup>
    </ElRow>
  </div>
  <ElDivider>
    <ElIcon><Star /></ElIcon>
    {{ title }}
    <ElIcon><Star /></ElIcon>
  </ElDivider>
</template>

<script lang="ts" setup>
import router from '@/router'
import { ElButton, ElButtonGroup, ElIcon, ElRow } from 'element-plus'
import { onMounted, ref, watch, watchEffect, shallowRef } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import { useThemeStore } from '@/stores/theme'

const title = ref('首页')
watchEffect(() => {
  const currentRoute = router.currentRoute
  if (currentRoute.value.name === 'triple') {
    title.value = '三元组示例标注'
  } else if (currentRoute.value.name === 'event') {
    title.value = '事件示例标注'
  } else {
    title.value = '首页'
  }
})

function goToTriple() {
  router.push('/triple')
}

function goToEvent() {
  router.push('/event')
}

const isDark = useDark({
  storageKey: 'annotator',
  valueDark: 'dark',
  valueLight: 'light'
})

const toggleDark = useToggle(isDark)

const themeStore = useThemeStore()

const themeIcon = shallowRef(Sunny)

onMounted(() => {
  themeStore.setCurrentTheme(isDark.value ? 'dark' : 'light')
})

watch(isDark, (val) => {
  const theme = val ? 'dark' : 'light'
  themeStore.setCurrentTheme(theme)
  if (theme === 'dark') {
    themeIcon.value = Moon
  } else {
    themeIcon.value = Sunny
  }
})
</script>

<style scoped lang="less">
.nav-header-container {
  height: 60%;
  display: flex;
  align-items: center;

  .el-row {
    flex: 1;
  }
}

.nav-button {
  width: 120px;
}
</style>
