import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import pinia from '../pinia'
import useCachedRouteStore from './cached-routes'
import { findCachedRoutes } from '../help'

// 本地存储路由信息
const visitedRoutes = JSON.parse(localStorage.getItem('visited-routes') || '[]')
// 已访问过的路由
const useVisitedRouteStore = defineStore('visited-routes', {
  state: () => {
    return {
      visitedRoutes: visitedRoutes as RouteRecordRaw[],
      // 是否初始化过
      isLoadAffix: false,
    }
  },
  getters: {
    getVisitedRoutes(state) {
      return state.visitedRoutes
    },
  },
  actions: {
    initAffixRoutes(affixRoutes: RouteRecordRaw[]) {
      // 反转数组，这样最近访问的路由就在最上头
      affixRoutes.reverse().forEach((affixRoute) => {
        // 判断affixRoute是否在已访问路由中
        // 如果没有，那么把他加入进来
        if (!this.visitedRoutes.find((it) => it.path === affixRoute.path)) {
          this.visitedRoutes.unshift(affixRoute)
        }
      })
      // 已初始化
      this.isLoadAffix = true
    },
    /**
     * 添加已访问路由
     * @param route
     * @returns
     */
    addVisitedRoute(route: RouteRecordRaw) {
      return new Promise((resolve) => {
        // 添加的路由不在已访问的路由数据中
        if (!this.visitedRoutes.find((it) => it.path === route.path)) {
          // 添加
          this.visitedRoutes.push(route)
          // 当前路由有名称
          if (route.name) {
            const cachedRoutesStore = useCachedRouteStore()
            // 判断添加的路由是否已被缓存，没有则把它缓存起来
            if (!cachedRoutesStore.cachedRoutes.includes(route.name as string)) {
              cachedRoutesStore.cachedRoutes.push(route.name as string)
            }
          }
          this.persistentVisitedView()
        }
        resolve(route)
      })
    },
    /**
     * 移除已放过的路由
     * @param route
     * @returns
     */
    removeVisitedRoute(route: RouteRecordRaw) {
      return new Promise<string>((resolve) => {
        // 在已访问的路由数组中找到需要删除的路由并删除它
        this.visitedRoutes.splice(this.visitedRoutes.indexOf(route), 1)
        this.persistentVisitedView()
        // 同时如果路由有名称，那么在缓存路由中也把它删除
        if (route.name) {
          const cachedRoutesStore = useCachedRouteStore()
          if (cachedRoutesStore.cachedRoutes.includes(route.name as string)) {
            cachedRoutesStore.cachedRoutes.splice(
              cachedRoutesStore.cachedRoutes.indexOf(route.name as string),
              1
            )
          }
        }
        // 返回最新最后的访问路由
        resolve(this.findLastRoutePath())
      })
    },
    /**
     * 找到最后访问的路由
     * @returns
     */
    findLastRoutePath() {
      return this.visitedRoutes && this.visitedRoutes.length > 0
        ? this.visitedRoutes[this.visitedRoutes.length - 1].path
        : '/'
    },
    /**
     * 关闭路由左边的所有路由
     * @param selectRoute
     * @returns
     */
    closeLeftVisitedView(selectRoute: RouteRecordRaw) {
      return new Promise((resolve) => {
        // 找到当前路由的索引
        const selectIndex = this.visitedRoutes.indexOf(selectRoute)
        // 有当前路由
        if (selectIndex !== -1) {
          this.visitedRoutes = this.visitedRoutes.filter((it, index) => {
            // 过滤获得 固定的路由+当前路由右侧的路由
            return (it.meta && it.meta.affix) || index >= selectIndex
          })
          // 缓存路由
          const cachedRoutesStore = useCachedRouteStore()
          // 设置的缓存路由
          cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
          this.persistentVisitedView()
        }
        resolve(selectRoute)
      })
    },
    /**
     * 关闭路由右边的所有路由
     * @param selectRoute
     * @returns
     */
    closeRightVisitedView(selectRoute: RouteRecordRaw) {
      return new Promise((resolve) => {
        const selectIndex = this.visitedRoutes.indexOf(selectRoute)
        if (selectIndex !== -1) {
          this.visitedRoutes = this.visitedRoutes.filter((it, index) => {
            return (it.meta && it.meta.affix) || index <= selectIndex
          })
          const cachedRoutesStore = useCachedRouteStore()
          cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
          this.persistentVisitedView()
        }
        resolve(selectRoute)
      })
    },
    /**
     * 关闭所有非固定的路由
     * @returns
     */
    closeAllVisitedView() {
      return new Promise<void>((resolve) => {
        this.visitedRoutes = this.visitedRoutes.filter((it) => {
          return it.meta && it.meta.affix
        })
        const cachedRoutesStore = useCachedRouteStore()
        cachedRoutesStore.setCachedRoutes(findCachedRoutes(this.visitedRoutes))
        this.persistentVisitedView()
        resolve()
      })
    },
    /**
     * 持久化访问路由
     */
    persistentVisitedView() {
      const tempPersistendRoutes = this.visitedRoutes.map((it) => {
        return {
          fullPath: it.path,
          meta: it.meta,
          name: it.name,
          path: it.path,
        }
      })
      //$id= defineStore('所填写的内容就是id')
      localStorage.setItem(this.$id, JSON.stringify(tempPersistendRoutes))
    },
    restoreVisitedView() {
      this.$reset()
    },
  },
  // 由于需要自定义持久化过程，所以这里就不能用插件来实现
  // presist: {
  //   enable: true,
  // },
})

export function useVisitedRoutesContext() {
  return useVisitedRouteStore(pinia)
}

export default useVisitedRouteStore
