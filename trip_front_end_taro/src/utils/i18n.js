// src/utils/i18n.js
const translations = {
  zh: {
    // 导航相关
    home: '首页',
    search: '搜索',
    hotel: '酒店',
    mine: '我的',
    booking: '预订',
    
    // 我的页面
    switchLanguage: '切换语言',
    chinese: '中文',
    english: '英文',
    myReviews: '我的评价',
    feedback: '意见反馈',
    aboutSystem: '关于系统',
    myFavorites: '我的收藏',
    myOrders: '我的订单',
    points: '积分',
    coupons: '优惠券',
    notLoggedIn: '未登录',
    welcomeBack: '欢迎回来',
    clickToLogin: '点击登录',
    loginNow: '立即登录',
    registerAccount: '注册账号',
    logout: '退出登录',
    tip: '提示',
    confirmLogout: '确定要退出登录吗？',
    pleaseLoginFirst: '请先登录',
    
    // 首页相关 - 已有部分
    checkIn: '入住',
    checkOut: '离店',
    destination: '目的地',
    selectDate: '选择日期',
    searchHotel: '搜索酒店',
    recommended: '推荐酒店',
    price: '价格',
    discount: '优惠',
    bookNow: '立即预订',
    seeDetails: '查看详情',
    
    // 首页新增
    domestic: '国内',
    overseas: '海外',
    hourlyRoom: '钟点房',
    homestay: '民宿',
    searchPlaceholder: '位置/品牌/酒店',
    defaultCity: '上海',
    loading: '加载中...',
    
    // 热门搜索
    hotSearch1: '上海外滩酒店',
    hotSearch2: '浦东机场附近',
    hotSearch3: '迪士尼度假区',
    hotSearch4: '南京路步行街',
    hotSearch5: '虹桥枢纽',
    hotSearch6: '豫园附近',
    hotSearch7: '陆家嘴金融中心',
    hotSearch8: '新天地商圈',
    
    // 日期相关
    checkInDate: '入住日期',
    today: '今天',
    tomorrow: '明天',
    dateFormat: 'MM月DD日',
    nightsCount: '共{count}晚',
    oneNight: '共1晚',
    
    // 快捷日期
    tonight: '今晚',
    tomorrowNight: '明晚',
    weekend: '周末',
    
    // 凌晨提示
    earlyMorningNotice: '当前已过0点，如需今天凌晨6点前入住，请选择"今天凌晨"',
    
    // 筛选相关
    priceStarFilter: '价格/星级',
    selectPrice: '选择价格',
    selectStar: '选择星级',
    noLimit: '不限',
    priceRange1: '0-200元',
    priceRange2: '200-400元',
    priceRange3: '400-600元',
    priceRange4: '600元以上',
    threeStarPlus: '三星级及以上',
    fourStarPlus: '四星级及以上',
    fiveStar: '五星级',
    
    // 快速标签
    freeParking: '免费停车场',
    pudongAirport: '上海浦东国际机场',
    hongqiaoAirport: '上海虹桥...',
    
    // 搜索历史
    clearSearchHistory: '清空搜索历史',
    confirmClearHistory: '确定要清空所有搜索历史吗？',
    cleared: '已清空',
    
    // AI助手相关
    aiAssistant: 'AI 助手',
    aiTravelAssistant: 'AI 旅行助手',
    aiWelcome: '您好！我是您的旅行助手。请问您想去哪里旅行，或者对酒店有什么要求？',
    aiInputPlaceholder: '例如：我想去上海预订酒店，预算500-1000元...',
    aiFoundRecommendations: '我为您找到了{count}个推荐',
    aiSearchingHotels: '我收到了您的请求，正在为您搜索合适的酒店...',
    unnamed: '未命名',
    noDescription: '暂无描述',
    requestFailed: '请求失败，状态码',
    serviceUnavailable: '抱歉，服务暂时不可用，请稍后再试。',
    sending: '发送中...',
    send: '发送',
    
    // 搜索页面
    filter: '筛选',
    sort: '排序',
    distance: '距离',
    rating: '评分',
    lowToHigh: '价格从低到高',
    highToLow: '价格从高到低',
    
    // 酒店详情页面
    hotelDetails: '酒店详情',
    facilities: '设施',
    reviews: '评价',
    location: '位置',
    selectRoom: '选择房型',
    nights: '晚',
    total: '总计',
    confirmBooking: '确认预订',
    cancel: '取消',
    
    // 预订页面
    bookingDetails: '预订详情',
    contactInfo: '联系人信息',
    name: '姓名',
    phone: '手机号',
    email: '邮箱',
    specialRequests: '特殊要求',
    paymentMethod: '支付方式',
    payNow: '立即支付',
    
    // 订单页面
    allOrders: '全部订单',
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    orderNumber: '订单号',
    orderTime: '下单时间',
    orderStatus: '订单状态',
    viewDetails: '查看详情',
    cancelOrder: '取消订单',
    
    // 收藏页面
    myCollections: '我的收藏',
    collectedHotels: '已收藏酒店',
    remove: '移除',
    
    // 登录注册
    login: '登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码',
    rememberMe: '记住我',
    noAccount: '还没有账号？',
    haveAccount: '已有账号？',
    
    // 通用
    noData: '暂无数据',
    confirm: '确定',
    back: '返回',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    more: '更多',
    close: '关闭',
    submit: '提交',
    success: '成功',
    error: '错误',
    networkError: '网络错误，请稍后重试'
  },
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    hotel: 'Hotel',
    mine: 'Mine',
    booking: 'Booking',
    
    // Mine Page
    switchLanguage: 'Switch Language',
    chinese: 'Chinese',
    english: 'English',
    myReviews: 'My Reviews',
    feedback: 'Feedback',
    aboutSystem: 'About',
    myFavorites: 'My Favorites',
    myOrders: 'My Orders',
    points: 'Points',
    coupons: 'Coupons',
    notLoggedIn: 'Not Logged In',
    welcomeBack: 'Welcome Back',
    clickToLogin: 'Click to Login',
    loginNow: 'Login Now',
    registerAccount: 'Register',
    logout: 'Logout',
    tip: 'Tip',
    confirmLogout: 'Are you sure to logout?',
    pleaseLoginFirst: 'Please login first',
    
    // Home Page - existing
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    destination: 'Destination',
    selectDate: 'Select Date',
    searchHotel: 'Search Hotel',
    recommended: 'Recommended Hotels',
    price: 'Price',
    discount: 'Discount',
    bookNow: 'Book Now',
    seeDetails: 'See Details',
    
    // Home Page - new additions
    domestic: 'Domestic',
    overseas: 'Overseas',
    hourlyRoom: 'Hourly Room',
    homestay: 'Homestay',
    searchPlaceholder: 'Location/Brand/Hotel',
    defaultCity: 'Shanghai',
    loading: 'Loading...',
    
    // Hot Searches
    hotSearch1: 'Shanghai Bund Hotels',
    hotSearch2: 'Near Pudong Airport',
    hotSearch3: 'Disney Resort Area',
    hotSearch4: 'Nanjing Road Pedestrian Street',
    hotSearch5: 'Hongqiao Hub',
    hotSearch6: 'Near Yuyuan Garden',
    hotSearch7: 'Lujiazui Financial Center',
    hotSearch8: 'Xintiandi Business District',
    
    // Date Related
    checkInDate: 'Check-in Date',
    today: 'Today',
    tomorrow: 'Tomorrow',
    dateFormat: 'MM/DD',
    nightsCount: '{count} nights',
    oneNight: '1 night',
    
    // Quick Dates
    tonight: 'Tonight',
    tomorrowNight: 'Tomorrow Night',
    weekend: 'Weekend',
    
    // Early Morning Notice
    earlyMorningNotice: 'It\'s past midnight. If you need to check in before 6am today, please select "Early Morning"',
    
    // Filter Related
    priceStarFilter: 'Price/Star Rating',
    selectPrice: 'Select Price',
    selectStar: 'Select Star Rating',
    noLimit: 'No Limit',
    priceRange1: '0-200元',
    priceRange2: '200-400元',
    priceRange3: '400-600元',
    priceRange4: '600+元',
    threeStarPlus: '3 Stars & Above',
    fourStarPlus: '4 Stars & Above',
    fiveStar: '5 Stars',
    
    // Quick Tags
    freeParking: 'Free Parking',
    pudongAirport: 'Pudong International Airport',
    hongqiaoAirport: 'Hongqiao Airport...',
    
    // Search History
    clearSearchHistory: 'Clear Search History',
    confirmClearHistory: 'Are you sure to clear all search history?',
    cleared: 'Cleared',
    
    // AI Assistant
    aiAssistant: 'AI Assistant',
    aiTravelAssistant: 'AI Travel Assistant',
    aiWelcome: 'Hello! I am your travel assistant. Where would you like to travel, or what are your hotel requirements?',
    aiInputPlaceholder: 'e.g.: I want to book a hotel in Shanghai with a budget of 500-1000元...',
    aiFoundRecommendations: 'I found {count} recommendations for you',
    aiSearchingHotels: 'I received your request and am searching for suitable hotels for you...',
    unnamed: 'Unnamed',
    noDescription: 'No Description',
    requestFailed: 'Request failed, status code',
    serviceUnavailable: 'Sorry, the service is temporarily unavailable. Please try again later.',
    sending: 'Sending...',
    send: 'Send',
    
    // Search Page
    filter: 'Filter',
    sort: 'Sort',
    distance: 'Distance',
    rating: 'Rating',
    lowToHigh: 'Price Low to High',
    highToLow: 'Price High to Low',
    
    // Hotel Details
    hotelDetails: 'Hotel Details',
    facilities: 'Facilities',
    reviews: 'Reviews',
    location: 'Location',
    selectRoom: 'Select Room',
    nights: 'nights',
    total: 'Total',
    confirmBooking: 'Confirm Booking',
    cancel: 'Cancel',
    
    // Booking Page
    bookingDetails: 'Booking Details',
    contactInfo: 'Contact Information',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    specialRequests: 'Special Requests',
    paymentMethod: 'Payment Method',
    payNow: 'Pay Now',
    
    // Order Page
    allOrders: 'All Orders',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    orderNumber: 'Order Number',
    orderTime: 'Order Time',
    orderStatus: 'Order Status',
    viewDetails: 'View Details',
    cancelOrder: 'Cancel Order',
    
    // Favorite Page
    myCollections: 'My Collections',
    collectedHotels: 'Collected Hotels',
    remove: 'Remove',
    
    // Login & Register
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password',
    rememberMe: 'Remember Me',
    noAccount: 'No account?',
    haveAccount: 'Already have an account?',
    
    // Common
    noData: 'No Data',
    confirm: 'Confirm',
    back: 'Back',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    more: 'More',
    close: 'Close',
    submit: 'Submit',
    success: 'Success',
    error: 'Error',
    networkError: 'Network error, please try again'
  }
};

export default translations;