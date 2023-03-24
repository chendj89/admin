import { findCachedRoutes } from '@/store/help'
import useCachedRouteStore from '@/store/modules/cached-routes'
import router from '..'

function useCachedGuard() {
  router.beforeEach(() => {
    const cachedRouteStore = useCachedRouteStore()
    if (cachedRouteStore.getCachedRouteName.length === 0) {
      // 获取所有路由并在其中找到所有标识有cacheable的路由
      // 初始化缓存路由
      cachedRouteStore.initCachedRoute(findCachedRoutes(router.getRoutes()))
    }
    return true
  })
}

export default useCachedGuard
