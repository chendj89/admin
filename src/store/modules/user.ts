import { defineStore } from 'pinia'
import { UserState } from '../types'
import store from '../pinia'
// 默认头像
import Avatar from '@/assets/img_avatar.gif'

const defaultAvatar = Avatar

const useUserStore = defineStore('user-info', {
  state: () => {
    return {
      userId: 0,
      roleId: 0,
      token: '',
      userName: '',
      nickName: '',
      avatar: defaultAvatar,
    }
  },
  actions: {
    /**
     * 保存用户信息
     * @param userInfo
     * @returns
     */
    saveUser(userInfo: UserState) {
      return new Promise<UserState>((resolve) => {
        this.userId = userInfo.userId
        this.roleId = userInfo.roleId
        this.token = userInfo.token
        this.userName = userInfo.userName
        this.nickName = userInfo.nickName
        this.avatar = userInfo.avatar || defaultAvatar
        resolve(userInfo)
      })
    },
    /**
     * token是否失效
     * @returns
     */
    isTokenExpire() {
      return !this.token
    },
    /**
     * 修改昵称
     * @param newNickName
     */
    changeNickName(newNickName: string) {
      this.nickName = newNickName
    },
    /**
     * 推出
     * 清空用户数据
     * 清除localStorage、sessionStorage
     * @returns
     */
    logout() {
      return new Promise<void>((resolve) => {
        this.$reset()
        localStorage.clear()
        sessionStorage.clear()
        resolve()
      })
    },
  },
  // 持久化插件
  presist: {
    // 开启
    enable: true,
    // 允许重置数据
    resetToState: true,
    // 重置时排除用户名
    option: {
      exclude: ['userName'],
    },
  },
})

export default useUserStore

export function useUserStoreContext() {
  return useUserStore(store)
}
