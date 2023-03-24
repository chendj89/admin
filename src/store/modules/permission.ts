import { RouteRecordRaw } from 'vue-router'
import { defineStore } from 'pinia'
import useUserStore from './user'
import router from '@/router'
import { baseAddress, getMenuListByRoleId } from '@/api/url'
import { post } from '@/api/http'
import defaultRoutes from '@/router/routes/default-routes'
import { findRootPathRoute, generatorRoutes, mapTwoLevelRouter } from '../help'
import { constantRoutes } from '@/router/routes/constants'

/**
 * 准许访问路由
 */
const usePermissionStore = defineStore('permission-route', {
  state: () => {
    return {
      // 允许路由
      permissionRoutes: [] as RouteRecordRaw[],
    }
  },
  getters: {
    /**
     * 获取所有meta.hidden部位空的路由
     * @param state
     * @returns
     */
    getPermissionSideBar(state) {
      return state.permissionRoutes.filter((it) => {
        return it.meta && !it.meta.hidden
      })
    },
    /**
     * 获取所有meta.hidden部位空并且有子页面的的路由
     * @param state
     * @returns
     */
    getPermissionSplitTabs(state) {
      return state.permissionRoutes.filter((it) => {
        return it.meta && !it.meta.hidden && it.children && it.children.length > 0
      })
    },
  },
  actions: {
    /**
     * 根据用户id和角色id获取路由
     * @param data
     * @returns
     */
    async getRoutes(data: { userId: number; roleId: number }) {
      try {
        // 如果有设置通过用户角色获取菜单的接口
        if (getMenuListByRoleId) {
          // 获取路由
          const res = await post({
            url: baseAddress + getMenuListByRoleId,
            // 在实际的开发中，这个地方可以换成 token，让后端解析用户信息获取 userId 和 roleId，前端可以不用传 userId 和 roleId。
            // 这样可以增加安全性
            data,
          })
          return generatorRoutes(res.data)
        } else {
          // 返回默认路由
          return generatorRoutes(defaultRoutes)
        }
      } catch (error) {
        console.log(
          '路由加载失败了，请清空一下Cookie和localStorage，重新登录；如果已经采用真实接口的，请确保菜单接口地址真实可用并且返回的数据格式和mock中的一样'
        )
        return []
      }
    },
    async initPermissionRoute() {
      // 用户信息
      const userStore = useUserStore()
      console.log('userStore', userStore)

      // 加载路由
      // 根据用户id和角色id获取不同的菜单
      const accessRoutes = await this.getRoutes({
        roleId: userStore.roleId,
        userId: userStore.userId,
      })
      // 将多层级的路由拍成2级路由
      const mapRoutes = mapTwoLevelRouter(accessRoutes)
      mapRoutes.forEach((it: any) => {
        // 加入到vue-router中
        router.addRoute(it)
      })
      // 配置 `/` 路由的默认跳转地址
      router.addRoute({
        path: '/',
        // meta.isRootPath 路由中应该只有1个路由拥有
        redirect: findRootPathRoute(accessRoutes),
        meta: {
          hidden: true,
        },
      })
      // 这个路由一定要放在最后
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        meta: {
          hidden: true,
        },
      })
      // 合并常规路由和动态路由
      this.permissionRoutes = [...constantRoutes, ...accessRoutes]
    },
    /**
     * 判断当前准许路由是否为空
     * @returns
     */
    isEmptyPermissionRoute() {
      return !this.permissionRoutes || this.permissionRoutes.length === 0
    },
    reset() {
      this.$reset()
    },
  },
})

export default usePermissionStore
