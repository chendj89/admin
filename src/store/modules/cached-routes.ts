import { toHump } from '@/utils'
import { defineStore } from 'pinia'

/**
 * 缓存路由数据
 */
const useCachedRouteStore = defineStore('cached-routes', {
  state: () => {
    return {
      cachedRoutes: [] as string[],
    }
  },
  getters: {
    getCachedRouteName(state) {
      return state.cachedRoutes
    },
  },
  actions: {
    initCachedRoute(routes: string[]) {
      this.cachedRoutes = routes.map((it) => {
        return toHump(it as string)
      })
    },
    setCachedRoutes(cachedRoutes: string[] = []) {
      this.cachedRoutes = cachedRoutes
    },
    /**
     * 重置缓存路由
     */
    resetCachedRoutes() {
      this.$reset()
    },
  },
})

export default useCachedRouteStore
