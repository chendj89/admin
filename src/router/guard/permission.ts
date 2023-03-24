import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'
import router from '..'

const whiteRoutes: string[] = ['/login', '/404', '/403', '/500']
/**
 * 权限守卫
 * 1、可以直接进入登录、404等这种白名单页面
 * 2、token过期、进入登录页面
 * 3、当前权限路由空，初始化权限路由数据并重新进入该页面
 * 4、允许进入该页面
 */
function usePermissionGuard() {
  router.beforeEach(async (to) => {
    // 白名单
    if (whiteRoutes.includes(to.path)) {
      return true
    }
    const userStore = useUserStore()
    // token是否过期
    if (userStore.isTokenExpire()) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }
    const permissionStore = usePermissionStore()
    // 判断是否为空权限路由
    const isEmptyRoute = permissionStore.isEmptyPermissionRoute()
    if (isEmptyRoute) {
      // 初始化权限路由
      await permissionStore.initPermissionRoute()
      // 重新进入
      return { ...to, replace: true }
    }
    return true
  })
}

export default usePermissionGuard
