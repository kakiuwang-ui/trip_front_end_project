export default {
  pages: [
    'pages/home/index',
    'pages/hotelList/index',
    'pages/hotelDetail/index',
    'pages/orderList/index',
    'pages/login/index',
    'pages/register/index',
    'pages/mine/index'
  ],
  window: {
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTitleText: '酒店预订小程序',
    navigationBarTextStyle: 'white',
    backgroundTextStyle: 'light'
  },
  // 纯文字TabBar（已删除所有图标配置，解决//报错）
  tabBar: {
    color: '#999',        // 未选中文字颜色
    selectedColor: '#1677ff', // 选中文字颜色（主色调）
    backgroundColor: '#fff',  // TabBar背景色
    borderStyle: 'black',     // 上边框（分隔页面和TabBar）
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页' // 仅保留文字，删除图标配置
      },
      {
        pagePath: 'pages/hotelList/index',
        text: '酒店' // 仅保留文字，删除图标配置
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的' // 仅保留文字，删除图标配置
      }
    ]
  },
  networkTimeout: {
    request: 10000,
    connectSocket: 10000
  },
  debug: false
}