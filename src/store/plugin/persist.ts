import { isObject } from '@vueuse/core'
import { PiniaPluginContext } from 'pinia'
import { toRaw } from 'vue'

interface PresistType<S, Store> {
  enable: boolean
  option: Partial<{
    key: string
    storage: 'local' | 'session'
    include: (keyof S)[]
    exclude: (keyof S)[]
  }>
  resetToState?: ((store: Store) => void) | boolean
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    presist?: Partial<PresistType<S, Store>>
  }
}

export default ({ options, store }: PiniaPluginContext) => {
  console.log('PiniaPluginContext=====>', options, store)
  const presist = options.presist
  if (presist && isObject(presist) && presist.enable) {
    // 设置默认值
    !presist.option && (presist.option = {})
    // 设置默认key 配置key或者store的id
    const key = presist.option?.key || store.$id
    presist.option!.key = key
    // 定义存储方式
    const storage = presist.option?.storage || 'local'
    presist.option!.storage = storage

    // 恢复状态
    if (presist.resetToState) {
      // 如果是布尔值
      if (typeof presist.resetToState === 'boolean') {
        // 读取localStorage对应key的数据
        const json = (window as any)[presist.option?.storage + 'Storage'].getItem(
          presist.option?.key
        )
        // 有值并转换为json对象并更新到store
        if (json) {
          store.$patch(JSON.parse(json))
        }
      } else if (typeof presist.resetToState === 'function') {
        // 如果是个函数 那么执行回调函数
        presist.resetToState.call(presist, store)
      }
    }
    // 响应 store 变化
    // 设置监听器
    store.$subscribe(
      (mutation, state) => {
        const toPersistObj = JSON.parse(JSON.stringify(toRaw(state)))
        if (presist.option?.include || presist.option?.exclude) {
          // 遍历localStore对应key的数据
          Object.keys(toPersistObj).forEach((it) => {
            // exclude中的数据将会被赋值为undefined
            // 不在include的将会被赋值为undefined
            if (
              (presist.option?.include && !presist.option?.include?.includes(it)) ||
              (presist.option?.exclude && presist.option?.exclude?.includes(it))
            ) {
              toPersistObj[it] = undefined
            }
          })
        }
        // 重新保存的浏览器中
        ;(window as any)[storage + 'Storage'].setItem(key, JSON.stringify(toPersistObj))
      },
      { detached: true }
    )
  }
}
