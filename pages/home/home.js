// pages/home/home.js
var util = require('../../utils/util.js');


var gData=getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setShow:false,
    plain:true,
  },
  showWin:function(){
    var animation_btn = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation_btn
    animation_btn.opacity(0.7).step()
    this.setData({
      btnAnimationJoi: animation_btn.export(),
    })

    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.scale(2).step()
    animation.scale(1).step()
    this.setData({
      animationData: animation.export(),
      'setShow': true
    })
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
      });
  },
  hideWin: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        'setShow':false
      })
    }.bind(this), 300)
  },
  stop:function(){

  },
  jump2Room:function(){   
    var that=this;
    wx: wx.request({
      url: 'http://101.200.62.252:8080/room/dismiss',
      data: {
        roomId: gData.id,
        userId: gData.id
      },
      header: { "content-Type": "application/x-www-form-urlencoded" },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log("POST--room/dismiss",res);
      },
      fail: function (res) { },
      complete: function (res) { },
    })

    //房主向后台申请创建房间
    wx:wx.request({
      url: 'http://101.200.62.252:8080/room/create',
      data: {
        userId:gData.id,
        roomName:"test",
        maxSize:6,
        level:1,
        picProvided:false,
        diyEnable:false,
        appendEnable:false
      },
      header: { "content-Type": "application/json"},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log("create room success")
        console.log(res);

        //成功之后进行跳转页面，注明房主身份
        var animation = wx.createAnimation({
          duration: 100,
          timingFunction: "linear",
          delay: 0
        })
        that.animation = animation
        animation.opacity(0.7).step()
        that.setData({
          btnAnimationCre: animation.export(),
        })
        wx.navigateTo({
          url: '../room/room?isOwner=true&roomId='+res.data.info+'&user='+JSON.stringify(gData.user),
        })
      },
      fail: function(res) {
        console.log("fail");
        console.log(res);
      },
      complete: function(res) {
        console.log("complete");
      },
    })
  },

  //加入房间访问后台
  enterRoom:function(e){
    var no = e.detail.roomNumber;
    console.log("nononononno:",no)
    wx:wx.request({
      url: 'http://101.200.62.252:8080/room/enter',
      data: {
        roomId:no,
        userId: gData.id
      },
      header: { "content-Type": "application/x-www-form-urlencoded"},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log("POST--room/enter:",res);
        wx.navigateTo({
          url: '../room/room?isOwner=false&user=' + JSON.stringify(gData.user),
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  jump2Ran:function(){
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0.7).step()
    this.setData({
      btnAnimationRan: animation.export(),
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  
})