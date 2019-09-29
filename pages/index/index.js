Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    active:0,
    canvasImg:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              _this.setData({
                avatarUrl:_this.getHDAvatar(res.userInfo.avatarUrl)
              })
            }
          })
        }
      }
    })
  },
  onShareAppMessage(){
    return {
      title:'给你的头像加个标～',
      path:'/pages/index/index',
      imageUrl:'../../images/logo.png'
    }
  },

  // 授权获取头像
  getCurrentAvatar(e) {
    console.log(e)
    this.setData({
      avatarUrl:this.getHDAvatar(e.detail.userInfo.avatarUrl)
    })
  },

  // 获取高清头像
  getHDAvatar(url) {
    let arr = url.split('/')
    arr[arr.length - 1] = 0
    let newUrl = arr.join('/')
    return newUrl
  },

 // 选择其他图片
  chooseOtherImg(){
    wx.chooseImage({
      count:1,
      success:res=>{
        console.log('otherIMg:',res.tempFilePaths[0])
        this.setData({
          avatarUrl: res.tempFilePaths[0]
        })
      },
    })
  },
  // 选择效果
  chooseEffect(e){
    console.log(e)
    this.setData({
      active:e.currentTarget.dataset.active
    })
  },
  
  // 合成头像
  buildAvatar(){
    const _this = this
    if(!this.data.avatarUrl){
      wx.showToast({
        title:'图片未加载',
        icon:'none'
      })
    }
    wx.showLoading({
      title: '正在生成中...'
    })
    let ctx = wx.createCanvasContext('canvas1', this)
    const promise1 = new Promise((resolve,reject)=>{
      wx.getImageInfo({
        src: _this.data.avatarUrl,
        success:(res)=>{
          console.log('promise1:',res)
          resolve(res)
        },
        fail:()=>{
          wx.hideLoading()
          reject('promise1 fail')
        }
      })
    })

    const promise2 = new Promise((resolve,reject)=>{
      wx.getImageInfo({
        src: `../../images/${this.data.active+1}.png`,
        success:(res)=>{
          console.log('promise2:',res)
          resolve(res)
        },
        fail: () => {
          wx.hideLoading()
          reject('promise2 fail')
        }
      })
    })

    Promise.all([promise1,promise2]).then(res=>{
      console.log('all promise:',res)
      let num = 1080
      ctx.drawImage(res[0].path, 0, 0, num, num)
      ctx.drawImage('../../' + res[1].path, 0, 0, num, num)
      ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: num,
          height: num,
          destWidth: num,
          destHeight: num,
          canvasId: 'canvas1',
          success: function (res) {
            console.log('canvasImg:',res)
            // _this.setData({
            //   canvasImg: res.tempFilePath
            // })
            wx.hideLoading()
            _this.saveImg(res.tempFilePath)
          },
          fail: function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '头像下载到临时路径失败，重试～',
              icon:'none'
            })
          }
        })
      })
    }).catch(err=>{
      wx.showToast({
        title: '合成失败，请重试～',
        icon:'none'
      })
    })
  },
  // 保存头像至相册
  saveImg(url){
    wx.saveImageToPhotosAlbum({
      filePath:url,
      success:()=>{
        wx.showToast({
          title: '头像已保存至相册',
          duration:3000,
          icon:'none'
        })
      },
      fail:()=>{
        wx.showToast({
          title: '头像保存失败，请重试～',
          icon:'none'
        })
      }
    })
  }
})