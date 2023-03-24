import router from '@/router'
import { projectName } from '@/setting'
/**
 * 动态修改页面的标题
 * 如果有设置meta.title 则会显示：项目名|标题
 * 否则显示：项目名
 */
function usePageTitleGuard() {
  router.afterEach((to) => {
    if (to.meta && to.meta.title) {
      const title = to.meta.title
      document.title = projectName + ' | ' + title
    } else {
      document.title = projectName
    }
  })
}

export default usePageTitleGuard
