// pages/game/game.js
const ctx = wx.createCanvasContext('myCanvas')
var x, y
var radius
var countdown = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:1,
    userPic1:"",
    currentId:1,
    currentWord:"",
    activeItemIndex: 4,
    time1:'',
    time2:'',
    flag_show1:false,
    flag_show2:false,
    itemWidth: [10, 20, 30, 40, 50, 60, 70],
    words:["a","b","c","d"],
    userInfo1:[
      {id:"",icon:"",name:"1111"}, 
      {id:"",icon: "",name: "2222"}, 
      {id:"",icon: "",name: "3333"}
    ],
    userInfo2: [
      {id: "",icon: "",name: "1111"},
      {id: "",icon: "",name: "2222"},
      {id: "",icon: "",name: "3333"}
    ]
  },

  /**
   * 每轮绘画结束时调用函数，切换玩家，弹出正确答案，跳出选词窗口
   */
  whenFinish:function () {
    var that=this;

    //todo:设置当前画画用户id
    //console.log("whenfinish");

    //弹出正确答案界面
    that.showWin(2);
    that.count(that, function(){}, 3, 2);

    setTimeout(function(){
      that.hideWin(2);
      if (that.currentId == that.userId) {
        that.showWin(1);
        that.count(that, function () { }, 5, 2);
        //如果倒计时结束仍未选择词，则默认选择第一个
        setTimeout(function () {
          that.hideWin(1);
          that.setData({
            "currentWord": that.data.words[0]
          });
          console.log("currentWord:" + that.data.currentWord);
        }, 3000);
      }
    },3000);
    
  },

  /**
   * 点击选词后修改当前的词，并且关闭选词窗口
   */
  chooseWord:function(e){
    var id=e.target.id.substring(4,5);
    this.setData({
      "currentWord":this.data.words[id]
    });
    console.log(this.data.currentWord);
    this.hideWin(1);
  },

  /**
   * 设定倒计时时间
   */
  count: function (that, func, time,id){
    var countdown = time;
    that.minus1s(that,func,countdown,id);
  },

  /**
   * 倒计时-1s,倒计时为0时执行函数
   */
  minus1s:function(that,func,countdown,id){
    if (countdown == 0) {
      func();
      return;
    } else {
      that.setData({
        ["time"+id]: countdown
      })
      countdown--;
      console.log("cnt_"+id+":"+that.data.time2);
    }
    setTimeout(function () {
      that.minus1s(that,func,countdown,id);
    }
      , 1000)
  },

  showWin:function(id){
    this.setData({
      ['flag_show'+id]: true
    });
  },

  hideWin:function(id){
    this.setData({
      ['flag_show'+id]: false
    });
  },

  stop:function(){
    //把点击事件拦截，啥都不用做。
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        that.setData({
          userId: userInfo.nickName,
          userPic1: userInfo.avatarUrl
        })
        that.setData({
          ["userInfo1[0].icon"]: userInfo.avatarUrl,
          // ["userInfo1[0].name"]: userInfo.nickName,
          ["userInfo1[1].icon"]: userInfo.avatarUrl,
          // ["userInfo1[1].name"]: userInfo.nickName,
          ["userInfo1[2].icon"]: userInfo.avatarUrl,
          // ["userInfo1[2].name"]: userInfo.nickName,
          ["userInfo2[0].icon"]: userInfo.avatarUrl,
          // ["userInfo2[0].name"]: userInfo.nickName,
          ["userInfo2[1].icon"]: userInfo.avatarUrl,
          // ["userInfo2[1].name"]: userInfo.nickName,
          ["userInfo2[2].icon"]: userInfo.avatarUrl,
          // ["userInfo2[2].name"]: userInfo.nickName,

        })
      }
    })
    that.count(that,function(){that.whenFinish();},3,1);
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var iniIndex = this.data.activeItemIndex
    var iniWidth = this.data.itemWidth[iniIndex]
    ctx.setLineWidth(iniWidth/2.25) // 设置线宽
    radius = iniWidth/4.5
    ctx.setLineCap('round') //设置线条的端点样式
    ctx.setStrokeStyle('#000000') //描边样式
    ctx.setFillStyle('#000000') //填充样式
    
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

  //坐标
  start: function (e) {
    x = e.touches[0].x
    y = e.touches[0].y
    
  },
  move: function (e) {

    ctx.moveTo(x, y) // 设置路径起点坐标
    x = e.touches[0].x
    y = e.touches[0].y
    ctx.lineTo(x, y) // 绘制一条直线
    ctx.stroke()
    ctx.draw(true)

  },
  end: function (e) {
    
    ctx.arc(x ,y , radius, 0, 2 * Math.PI)//圆点
    ctx.fill()
    ctx.draw(true)
  },

  setItemWidth: function (event) {
    var width = event.target.dataset.width
    ctx.setLineWidth(width/2.25)
    radius = width/4.5
    this.setData({
      activeItemIndex: event.target.dataset.index
    })
  }

})