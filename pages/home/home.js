// pages/home/home.js
var util = require('../../utils/util.js');


var gData = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flags:[
      false,
      false
    ],
    styles:[
      "",
      ""
    ],
    maxNum:6,
    isPrivate:true,
    plain: true,
  },

  showWin: function (i) {
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
    //界面弹出
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(1).step()
    this.setData({
      animationData: animation.export(),
      ["flags["+i+"]"]: true,
    })
    animation.translateY(0).step()
    this.setData({
      animationData: animation.export(),
    });
  },
  hideWin: function (i) {
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
        ["flags["+i+"]"]: false,
      })
    }.bind(this), 300)
  },
  //拦截点击事件，空函数体，do nothing
  stop: function () {

  },
  btnCreClicked: function () {
    this.showWin(1);
    this.setData({
      isPrivate: false,
      ["styles[0]"]: "background:red;"
    });
  },
  btnJoinClicked: function () {
    this.showWin(0);
  },
  vwCreClicked:function(){
    this.hideWin(1);
  },
  vwJoinClicked:function(){
    this.hideWin(0);
  },
  btnPriClicked:function(e){
    var id=e.currentTarget.id;
    this.setData({
      styles:["",""]
    });
    if(id=="btn_public"){
      this.setData({
        isPrivate:false,
        ["styles[0]"]:"background:red;"
      });
    }else if(id=="btn_private"){
      this.setData({
        isPrivate: true,
        ["styles[1]"]: "background:red;"
      });
    }
  },
  //跳转至房间页面
  jump2Room: function () {
    var that = this;
    //request 查询用户是否在房间
    util.req_getPlayer({
      userId: gData.id
    }, (res) => {
      console.log("POST--player/get", res);
      if (res.data.status == "SUCCESS") {
        //request 将用户退出房间
        util.req_quitRoom({
          roomId: res.data.info.roomId,
          userId: res.data.info.userId
        }, (res) => {
          console.log("POST--room/quit", res);
          that.cbCreateRoom();
        });
      } else {
        that.cbCreateRoom();
      }
    })
  },

  //加入房间访问后台
  enterRoom: function (e) {
    var no = e.detail.value.roomNumber;
    console.log("nononononno:", e.detail);
    //request 向后台请求加入房间
    util.req_enterRoom({
      roomId: no,
      userId: gData.id
    }, (res) => {
      console.log("POST--room/enter:", res);
      if ("ERROR" == res.data.status) {
        console.log("用户无法进入房间！错误代码：", res.data.info);
        return;
      }
      wx.navigateTo({
        url: '../room/room?isOwner=false&roomId=' + no + '&user=' + JSON.stringify(gData.user),
      })
    });
  },

  jump2Ran: function () {
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

  cbCreateRoom: function () {
    var that = this;
    //request 房主向后台申请创建房间
    util.req_createRoom({
      userId: gData.id,
      roomName: "test",
      maxSize: 6,
      level: 1,
      picProvided: false,
      diyEnable: false,
      appendEnable: false
    }, (res) => {
      console.log("POST--room/create", res);
      if ("ERROR" == res.data.status) {
        console.log("用户无法创建房间,错误代码：", res.data.info);
        return;
      }
      //成功之后进行跳转页面，注明房主身份
      //TODO: 封装动画
      var animation = wx.createAnimation({
        duration: 40,
        timingFunction: "linear",
        delay: 0
      })
      that.animation = animation
      animation.opacity(0.7).step()
      animation.opacity(1).step()
      that.setData({
        btnAnimationCre: animation.export(),
      })
      wx.navigateTo({
        url: '../room/room?isOwner=true&roomId=' + res.data.info + '&user=' + JSON.stringify(gData.user),
      })
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