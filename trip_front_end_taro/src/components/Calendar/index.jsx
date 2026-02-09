import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import dayjs from 'dayjs'
import './index.css'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const Calendar = ({ 
  visible = false,
  onClose = () => {},
  onSelect = () => {},
  onConfirm = () => {},
  startDate = '',
  endDate = '',
  today: propToday = '',
  mode = 'range' // 新增：模式参数，'range'为区间选择，'single'为单日期选择
}) => {
  // 基础日期计算
  const today = useMemo(() => propToday || dayjs(), [propToday])
  const todayStr = today.format('YYYY-MM-DD')
  const maxDate = useMemo(() => today.add(30, 'day'), [today])
  
  // 生成可预约的月份列表（今天所在的月份到maxDate所在的月份）
  const availableMonths = useMemo(() => {
    const months = []
    let currentMonth = today.startOf('month')
    const endMonth = maxDate.startOf('month')
    
    while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth, 'month')) {
      months.push(currentMonth.clone())
      currentMonth = currentMonth.add(1, 'month')
    }
    
    return months
  }, [today, maxDate])
  
  // 当前显示的月份索引
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  
  // 当前显示的月份
  const currentMonth = useMemo(() => 
    availableMonths[currentMonthIndex] || availableMonths[0] || today.startOf('month'), 
  [availableMonths, currentMonthIndex, today])
  
  // 获取当前月份的开始日期和结束日期
  const monthStart = currentMonth.startOf('month')
  const monthEnd = currentMonth.endOf('month')
  
  // 根据模式决定标题
  const headerTitle = useMemo(() => {
    return mode === 'single' ? '选择入住日期' : '选择入住/离店日期'
  }, [mode])
  
  // 生成当前月的日期网格
  const generateMonthGrid = useCallback(() => {
    const grid = []
    const firstDayOfWeek = monthStart.day() // 0=周日, 1=周一, ... 6=周六
    
    // 1. 填充前面的空白格子（上个月的日期）
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null) // 空白格子
    }
    
    // 2. 填充当前月的所有日期
    let currentDay = monthStart.clone()
    while (currentDay.isBefore(monthEnd) || currentDay.isSame(monthEnd, 'day')) {
      grid.push(currentDay.clone())
      currentDay = currentDay.add(1, 'day')
    }
    
    // 3. 补全到42个格子（6行×7列）
    while (grid.length < 42) {
      grid.push(null)
    }
    
    return grid
  }, [monthStart, monthEnd])
  
  // 处理月份切换 - 只能在可预约月份内切换
  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(prev => prev - 1)
    }
  }
  
  const handleNextMonth = () => {
    if (currentMonthIndex < availableMonths.length - 1) {
      setCurrentMonthIndex(prev => prev + 1)
    }
  }
  
  // 检查是否可以切换到上个月
  const canGoPrevMonth = currentMonthIndex > 0
  
  // 检查是否可以切换到下个月
  const canGoNextMonth = currentMonthIndex < availableMonths.length - 1
  
  // 处理日期点击
  const handleDayClick = (day) => {
    if (!day) return

    const dayStr = day.format('YYYY-MM-DD')
    console.log('📅 日期点击:', dayStr)

    // 检查日期是否在可选范围内
    if (day.isBefore(today, 'day') || day.isAfter(maxDate, 'day')) {
      console.log('❌ 日期超出可选范围')
      return
    }
    
    console.log('✅ 日期可选, 当前模式:', mode, '开始日期:', startDate, '结束日期:', endDate)

    if (mode === 'single') {
      // 单日期模式：直接选择该日期
      console.log('📍 单日期模式: 选择', dayStr)
      onSelect(dayStr, '')
      // 单日期模式选择后立即确认
      onConfirm()
    } else {
      // 区间模式：更灵活的选择逻辑
      if (!startDate || (startDate && endDate)) {
        // 第一次选择，或重新开始选择
        console.log('📍 区间模式: 选择第一个日期', dayStr)
        onSelect(dayStr, '')
      } else if (!endDate) {
        // 已经有第一个日期,选择第二个日期
        const firstDay = dayjs(startDate)
        const secondDay = day

        if (secondDay.isSame(firstDay, 'day')) {
          // 如果选择的是同一天，就不处理
          console.log('⚠️ 选择了同一天，忽略')
          return
        }

        // 自动判断哪个是入住日期(较早)、哪个是离店日期(较晚)
        if (secondDay.isAfter(firstDay, 'day')) {
          // 第二个日期在第一个日期之后 → 正常顺序
          console.log('📍 区间模式: 入住', startDate, '离店', dayStr)
          onSelect(startDate, dayStr)
        } else {
          // 第二个日期在第一个日期之前 → 自动调换顺序
          console.log('📍 区间模式: 自动调换顺序 → 入住', dayStr, '离店', startDate)
          onSelect(dayStr, startDate)
        }
      }
    }
  }
  
  // 检查日期是否可选
  const isDaySelectable = (day) => {
    if (!day) return false

    // 基础检查：不能早于今天，不能晚于maxDate
    if (day.isBefore(today, 'day') || day.isAfter(maxDate, 'day')) {
      return false
    }

    // 移除了限制：现在所有在有效范围内的日期都可选
    // 用户可以随时点击任何日期来重新选择入住日期

    return true
  }
  
  // 获取日期状态
  const getDayStatus = (day) => {
    if (!day) return ''
    
    const dayStr = day.format('YYYY-MM-DD')
    
    // 是否被选中
    if (dayStr === startDate || dayStr === endDate) {
      return 'selected'
    }
    
    // 区间模式下检查是否在选择范围内
    if (mode === 'range' && startDate && endDate) {
      const start = dayjs(startDate)
      const end = dayjs(endDate)
      if (day.isAfter(start, 'day') && day.isBefore(end, 'day')) {
        return 'in-range'
      }
    }
    
    return ''
  }
  
  // 检查日期是否在当前月份
  const isInCurrentMonth = (day) => {
    if (!day) return false
    return day.month() === currentMonth.month() && day.year() === currentMonth.year()
  }
  
  // 计算入住晚数
  const calculateNights = () => {
    if (!startDate || !endDate) return 0
    return dayjs(endDate).diff(dayjs(startDate), 'day')
  }
  
  // 获取月份状态标签
  const getMonthStatus = () => {
    if (availableMonths.length === 0) return ''
    
    const isFirstMonth = currentMonthIndex === 0
    const isLastMonth = currentMonthIndex === availableMonths.length - 1
    
    if (isFirstMonth && isLastMonth) {
      return '（仅此月）'
    } else if (isFirstMonth) {
      return '（首月）'
    } else if (isLastMonth) {
      return '（末月）'
    }
    
    return ''
  }
  
  // 渲染底部确认栏 - 根据模式不同
  const renderFooter = () => {
    if (mode === 'single') {
      return (
        <View className='calendar-footer'>
          <View className='summary'>
            {startDate ? (
              <View className='date-summary'>
                <Text className='summary-text'>
                  已选择：{dayjs(startDate).format('MM月DD日')}
                </Text>
                <Text className='date-range'>
                  点击任意日期可重新选择
                </Text>
              </View>
            ) : (
              <Text className='summary-text'>
                请选择入住日期
              </Text>
            )}
          </View>
          
          <Button
            className={`confirm-btn ${startDate ? 'active' : ''}`}
            disabled={!startDate}
            onClick={onConfirm}
          >
            确定
          </Button>
        </View>
      )
    } else {
      return (
        <View className='calendar-footer'>
          <View className='summary'>
            {startDate && endDate ? (
              <View className='date-summary'>
                <Text className='summary-text'>
                  共 {calculateNights()} 晚
                </Text>
                <Text className='date-range'>
                  {dayjs(startDate).format('MM月DD日')} - {dayjs(endDate).format('MM月DD日')}
                </Text>
              </View>
            ) : startDate ? (
              <View className='date-summary'>
                <Text className='summary-text'>
                  已选：{dayjs(startDate).format('MM月DD日')}
                </Text>
                <Text className='date-range'>
                  请选择第二个日期（无需考虑先后顺序）
                </Text>
              </View>
            ) : (
              <Text className='summary-text'>
                请选择两个日期
              </Text>
            )}
          </View>
          
          <Button
            className={`confirm-btn ${startDate && endDate ? 'active' : ''}`}
            disabled={!startDate || !endDate}
            onClick={onConfirm}
          >
            确定
          </Button>
        </View>
      )
    }
  }
  
  if (!visible) return null
  
  const monthGrid = generateMonthGrid()
  const monthTitle = currentMonth.format('YYYY年MM月')
  
  return (
    <View className='calendar-container'>
      {/* 遮罩层 */}
      <View className='calendar-mask' onClick={onClose} />
      
      {/* 日历内容 */}
      <View className='calendar-main'>
        {/* 头部 */}
        <View className='calendar-header'>
          <Text className='header-title'>{headerTitle}</Text>
          <View className='close-btn' onClick={onClose}>
            <Text className='close-text'>×</Text>
          </View>
        </View>
        
        {/* 月份切换栏 */}
        <View className='month-switcher'>
          <View 
            className={`prev-month-btn ${!canGoPrevMonth ? 'disabled' : ''}`}
            onClick={canGoPrevMonth ? handlePrevMonth : undefined}
          >
            <Text className='arrow-icon'>‹</Text>
          </View>
          
          <View className='current-month-info'>
            <Text className='current-month-title'>{monthTitle}</Text>
            <Text className='month-status-label'>{getMonthStatus()}</Text>
          </View>
          
          <View 
            className={`next-month-btn ${!canGoNextMonth ? 'disabled' : ''}`}
            onClick={canGoNextMonth ? handleNextMonth : undefined}
          >
            <Text className='arrow-icon'>›</Text>
          </View>
        </View>
        
        {/* 预约提示 */}
        <View className='booking-notice'>
          <Text className='notice-text'>
            📅 可选日期：今天至{maxDate.format('MM月DD日')}（共30天）
          </Text>
          {mode === 'range' && startDate && !endDate && (
            <Text className='notice-text' style={{ color: '#1677ff', fontWeight: 500 }}>
              💡 请选择第二个日期（系统会自动识别入住和离店日期）
            </Text>
          )}
        </View>
        
        {/* 星期标题 */}
        <View className='weekdays'>
          {WEEKDAYS.map(day => (
            <Text key={day} className='weekday'>{day}</Text>
          ))}
        </View>
        
        {/* 日期网格 */}
        <View className='dates-grid'>
          {monthGrid.map((day, index) => {
            const isInMonth = isInCurrentMonth(day)
            const isSelectable = isDaySelectable(day) && isInMonth
            const status = getDayStatus(day)
            const isToday = day ? day.isSame(today, 'day') : false
            const isStartDate = day ? day.format('YYYY-MM-DD') === startDate : false
            const isEndDate = mode === 'range' && day ? day.format('YYYY-MM-DD') === endDate : false
            
            return (
              <View
                key={index}
                className={`date-cell ${status} ${isSelectable ? 'selectable' : 'disabled'} ${!isInMonth ? 'other-month' : ''}`}
                onClick={() => isSelectable && handleDayClick(day)}
              >
                {day ? (
                  <View className='day-content'>
                    <Text className={`day-number ${isToday ? 'today' : ''}`}>
                      {day.date()}
                    </Text>
                    {/* 优先级：入住/离店 > 今天 > 不可选 */}
                    {isStartDate && isInMonth ? (
                      <Text className='day-label start-label'>入住</Text>
                    ) : isEndDate && isInMonth ? (
                      <Text className='day-label end-label'>离店</Text>
                    ) : isToday && isInMonth ? (
                      <Text className='day-label today-label'>今天</Text>
                    ) : !isSelectable && isInMonth ? (
                      <Text className='day-label disabled-label'>不可选</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            )
          })}
        </View>
        
        {/* 底部 */}
        {renderFooter()}
      </View>
    </View>
  )
}

export default Calendar