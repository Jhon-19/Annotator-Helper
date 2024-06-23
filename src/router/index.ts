import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw
} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/App.vue')
  },
  {
    path: '/triple',
    name: 'triple',
    component: () => import('@/views/triple-annotator.vue')
  },
  {
    path: '/event',
    name: 'event',
    component: () => import('@/views/event-annotator.vue')
  }
]

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
