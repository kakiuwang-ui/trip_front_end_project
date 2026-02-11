
import Taro, { useLaunch } from '@tarojs/taro'
import { resolveTheme, applyNativeTheme, getSavedTheme, THEME } from './utils/theme'

import './app.css'

function App({ children }) {
  useLaunch(() => {
    // 初始化：应用原生主题（NavigationBar + TabBar）
    applyNativeTheme(resolveTheme())

    // 监听系统主题变化（需要 app.config.js 中设置 darkmode: true）
    Taro.onThemeChange(({ theme }) => {
      // 只有"跟随系统"模式下才响应系统变化
      if (getSavedTheme() === THEME.SYSTEM) {
        applyNativeTheme(theme)
        // 广播给所有页面的 useTheme hook
        Taro.eventCenter.trigger('themeChanged', theme)
      }
    })
  })

  // children 是将要会渲染的页面
  return children
}



export default App
