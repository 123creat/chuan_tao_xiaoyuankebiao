import {getCourseListRequest} from '../../api/main'
import {getNowWeek} from '../../utils/util'
const courseCacheKey = "courses"
const courseColorCacheKey = "courseColor"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowWeek: 1, // 当前周
    totalWeek: 20, // 周总数
    showSwitchWeek: false, // 显示选择周数弹窗
    weekDayCount: 7,
    startDate: '2023/09/03', // 开学日期
    weekIndexText: ['一', '二', '三', '四', '五', '六', '日'],
    nowMonth: 1, // 当前周的月份
    courseList: [
      // {
      //   name:'计算机网络',
      //   week:1,
      //   section:1,
      //   sectionCount:2,
      //   address:'中心机房5号',
      //   color:'#D06969'
      // }
      // {
      //   name:'计算机英语',
      //   week:2,
      //   section:3,
      //   sectionCount:2,
      //   address:'医农大N201',
      //   color:'#86D069'
      // },
      // {
      //   name:'操作系统',
      //   week:1,
      //   section:5,
      //   sectionCount:2,
      //   address:'主教楼S322',
      //   color:'#AE69D0'
      // },
      // {
      //   name:'嵌入式系统',
      //   week:3,
      //   section:3,
      //   sectionCount:2,
      //   address:'人文楼N107',
      //   color:'#D06969'
      // },
      // {
      //   name:'JAVA实战开发',
      //   week:4,
      //   section:1,
      //   sectionCount:2,
      //   address:'实训楼W314',
      //   color:'#AE69D0'
      // },
      // {
      //   name:'计算机导论',
      //   week:5,
      //   section:3,
      //   sectionCount:2,
      //   address:'人文楼N107',
      //   color:'#86D069'
      // }
      // {
      //     name:'网络工程',
      //     week:2,
      //     section:1,
      //     sectionCount:1,
      //     address:'人文楼N107',
      //     color:'#D06969'
      //   },
      //   {
      //       name:'大学体育1',
      //       week:2,
      //       section:3,
      //       sectionCount:2,
      //       address:'人文楼N107',
      //       color:'#86D069'
      //     },
      //     {
      //         name:'计算机导论',
      //         week:3,
      //         section:5,
      //         sectionCount:4,
      //         address:'人文楼N107',
      //         color:'#86D069'
      //       }
    ],
    colorList: [
      "#116A7B",
      "#DD58D6",
      "#30A2FF",
      "#0079FF",
      "#F79327",
      "#47A992",
      "#7A3E3E",
      "#FF55BB",
      "#A0D8B3",
      "#539165",
      "#3A98B9",
      "#609966",
    ],
    courseColor: {},
    weekCalendar: [1, 2, 3, 4, 5, 6, 7],
    firstEntry: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {
      windowWidth
    } = wx.getSystemInfoSync()
    this.setData({
      windowWidth
    })
    this.getWeekDates()
    this.getNowWeek()
    this.getData()
    this.getTodayDate()
  },

  selectWeek() {
    this.setData({
      showSwitchWeek: true
    })
  },

  switchWeek(e) {
    const week = e.currentTarget.dataset.week
    this.setData({
      showSwitchWeek: false
    })
    this.switchWeekFn(week)
  },

  // 切换周数
  switchWeekFn(week) {
    this.setData({
      nowWeek: week
    })
    this.getWeekDates()
  },

  hideSwitchWeek() {
    this.setData({
      showSwitchWeek: false
    })
  },

  getWeekDates() {
    const startDate = new Date(this.data.startDate)
    const addTime = (this.data.nowWeek - 1) * 7 * 24 * 60 * 60 * 1000
    const firstDate = startDate.getTime() + addTime
    const {
      month: nowMonth
    } = this.getDateObject(new Date(firstDate))
    const weekCalendar = []
    for (let i = 0; i < this.data.weekDayCount; i++) {
      const date = new Date(firstDate + i * 24 * 60 * 60 * 1000)
      const {
        day
      } = this.getDateObject(date)
      weekCalendar.push(day)
    }
    this.setData({
      nowMonth,
      weekCalendar
    })
  },

  getDateObject(date = new Date()) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return {
      year,
      month,
      day
    }
  },

  getNowWeek() {
    const nowWeek = getNowWeek(this.data.startDate, this.data.totalWeek)
    this.setData({
      nowWeek
    })
    this.getWeekDates()
  },

  getData() {
    const cache = wx.getStorageSync(courseCacheKey)
    const courseColorCache = wx.getStorageSync(courseColorCacheKey)
    if (cache) {
      this.setData({
        courseList: cache,
      })
      if (!courseColorCache) {
        this.buildCourseColor()
      } else {
        this.setData({
          courseColor: courseColorCache
        })
      }
      return
    }
    this.updateFn(true)
  },

  update() {
    this.updateFn()
  },

  updateFn(firstEntry = false) {
    const that = this
    getCourseListRequest().then(res => {
      that.setData({
        courseList: res.data
      })
      that.buildCourseColor()
      if (!firstEntry) {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
      }
      wx.setStorageSync(courseCacheKey, res.data)
    })
  },

  swiperSwitchWeek(e) {
    if (e.detail.source == '') {
      this.setData({
        firstEntry: false
      })
      return
    }
    const index = e.detail.current
    this.switchWeekFn(index + 1)
  },

  buildCourseColor() {
    const courseColor = {}
    let colorIndex = 0
    this.data.courseList.map(item => {
      if (courseColor[item.name] === undefined) {
        courseColor[item.name] = this.data.colorList[colorIndex]
        colorIndex++
      }
    })
    wx.setStorageSync(courseColorCacheKey, courseColor)
    this.setData({
      courseColor
    })
  },

  // 获取今天日期
  getTodayDate() {
    const {
      month: todayMonth,
      day: todayDay
    } = this.getDateObject()
    this.setData({
      todayMonth,
      todayDay
    })
  },

  navCourseDetail(e) {
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/course-detail/index?info=${JSON.stringify(this.data.courseList[index])}`,
    })
  }
})