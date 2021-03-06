// pages/room/room.js
var util = require('../../utils/util.js');
const gData = getApp().globalData;
var roomId = 0;
var isOwner=false;
var userNum = 0;
var maxNum=0;

var Stomp = require('../../utils/stomp.js').Stomp;
var socketOpen = false
var socketMsgQueue = []
function sendSocketMessage(msg) {
  console.log('send msg:')
  console.log(msg);
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    })
  } else {
    socketMsgQueue.push(msg);
  }
}

function closeSocket(){
  console.log('close socket')
  if (socketOpen) {
    wx.closeSocket({
      code: 0,
      reason: 'hide room',
      success: function (res) {
        console.log("closeSocket:", res);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
}

var ws = {
  send: sendSocketMessage,
  close: closeSocket,
  onopen: null,
  onmessage: null
}
Stomp.setInterval = function () { }
Stomp.clearInterval = function () { }
var client = Stomp.over(ws);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    roomNo: 0,
    btn_style: "border-radius:60rpx;border:none;color: rgb(240,220,200);background-color: gray;opacity:0.9;",
    flags:[
      true,//开始按钮是否显示
      false //开始游戏按钮是否可用
      ],
    users: []
  },
  startGame: function () {
    var dest = '/topic/roomId/' + roomId;
    //房主向其他用户广播消息，并且申请开始游戏
    client.send(dest, { priority: 9 }, JSON.stringify({ type: "START" }));
    util.req_startGame({
      roomId:roomId
    },res=>{
      console.log("GET----startGame:",res);
    });
    wx.navigateTo({
      url: '../game/game?roomId=' + roomId +"&maxNum="+maxNum + '&users=' + JSON.stringify(this.data.users)
    })
  },

  getUserNum: function(){
    var u = this.data.users;
    var num = 0;
    for(var i = 0;i < u.length;i++)
    {
      if(u[i].id!=0)
      {
        num++;
      }
    }
    return num;
  },
  addUser: function (user) {
    if (this.findId(user.id) != -1) {
      return;
    }
    var u = this.data.users;
    for (var i = 0; i < maxNum; i++) {
      if (u[i].id == 0) {
        this.setData({
          ["users[" + i + "]"]: user
        });
        break;
      }
    }
    userNum++;

    //如果当前用户数量大于2，开始按钮取消disabled
    if (this.getUserNum() >= 2) {
      this.setData({
        btn_style: "border-radius:60rpx;border:none;color: rgb(240,220,200);background-color: dodgerblue;opacity:0.9;",
        ["flags[1]"]: false
      })
    }
  },

  updateUser: function (users) {
    var that = this;
    //更新玩家
    //成功后将玩家信息对前端进行更新
    var u = that.data.users;
    for (var i = 0; i < maxNum; i++) {
      that.setData({
        ["users[" + i + "]"]: new util.user(0, "空位", "")
      });
    }
    //先把开始按钮disable掉
    that.setData({
      btn_style: "border-radius:60rpx;border:none;color: rgb(240,220,200);background-color: gray;opacity:0.9;",
      ["flags[1]"]: true
    })
    for(var i = 0;i < users.length; i++)
    {
      that.addUser(new util.user(users[i].userId, users[i].nickName, users[i].photo));
    }
    userNum = users.length;
  },

  //查询玩家id是否在玩家池中
  findId: function (id) {
    var u = this.data.users;
    for (var i = 0; i < maxNum; i++) {
      if (u[i].id == id) {
        return i;
      }
    }
    return -1;
  },

  //进入房间后初始化数据，包括房间内的各种信息
  initData: function () {
    //初始化空位
    var that = this;
    for (var i = 0; i < maxNum; i++) {
      this.data.users.push(new util.user(0, "空位", ""));

    }
    this.setData({
      users: this.data.users
    })
    //连接websocket
    wx.connectSocket({
      url: 'ws://liuyifan.club:8080/webSocket',
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      socketOpen = true
      for (var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i])
      }
      socketMsgQueue = []
      ws.onopen && ws.onopen()
    })

    wx.onSocketMessage(function (res) {
      console.log('收到onmessage事件:', )
      ws.onmessage && ws.onmessage(res)
    });

    var destination = '/topic/roomId/' + roomId;
    client.connect('user', 'pass', function (sessionId) {
      // 接收广播并将加入房间的新用户初始化
      client.subscribe(destination, function (body, headers) {
        var data = JSON.parse(body.body);
        //收到开始游戏的广播，开始游戏
        if (data.type == "START") {
          if (!isOwner) {
            console.log("startGame:", data.type);
            wx.navigateTo({
              url: '../game/game?roomId=' + roomId +"&maxNum="+maxNum + '&users=' + JSON.stringify(that.data.users)
            });
          }
        } else if (data.type == "ENTER") {
          //查询房间内所有用户的id,并加入玩家池
          that.getUserInfoInRoom(roomId, (res) => {
            console.log("GET--user/find:", res);
            var users = res.data;
            for (var i = 0; i < users.length; i++) {
              that.addUser(new util.user(users[i].userId, users[i].nickName, users[i].photo));
            }
          });
        } else if (data.type == "ROOM_MESSAGE") {
          //查询房间内所有用户的id,并从玩家池中删除
          that.getUserInfoInRoom(roomId, (res) => {
            console.log("GET--user/find:", res);
            var users = res.data;
            that.updateUser(users);
          });
        }
      });
      
      client.send(destination, { priority: 9 }, JSON.stringify({ type: "ENTER", content: gData.id }));
    })
  },
  //如果不是房主，隐藏开始游戏按钮
  setStartBtn:function(){
    var that=this;
    console.log("-----isOwner",isOwner)
    if (isOwner) {
      that.setData({
        ["flags[0]"]: true
      });
    } else {    
      that.setData({
        ["flags[0]"]: false
      })
    }
  },
  getUserInfoInRoom: function (roomId, callback) {
    var that = this;
    //request 查询房间内所有用户的id
    util.req_findRoom({
      roomId: roomId
    }, (res) => {
      console.log("POST----room/find:",res);
      //更新信息时，更新房主的归属
      if (gData.id == res.data.info.userId){
        isOwner=true;
      }else{
        isOwner=false;
      }
      that.setStartBtn();
      var players = res.data.info.players;
      var userIds = [];
      userIds.push(res.data.info.userId);
      for (var i = 0; i < players.length; i++) {
        userIds.push(players[i].userId);
      }
      //request 查询房间内所有用户的信息并加入
      util.req_findUser(userIds, callback);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    maxNum = options.maxNum;
    userNum=0;
    var user = gData.user
    roomId = options.roomId;
    that.setData({
      roomNo: roomId
    })
    console.log("button:", options);
    isOwner = options.isOwner;
    //将自己的信息广播给其他已经进入房间的用户
    that.setStartBtn();
    that.initData();
    console.log("roomId:", options.maxNum);
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
    var that=this;
    //查询房间内所有用户的id,并从玩家池中删除
    that.getUserInfoInRoom(roomId, (res) => {
      console.log("GET--user/find:", res);
      var users = res.data;
      that.updateUser(users);
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // client.disconnect(function () {
    //   console.log("stomp disconnected success");
    // });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    client.disconnect(function () {
      console.log("stomp disconnected success");
    });
    console.log("unload",userNum);
    util.req_quitRoom({
      roomId: roomId,
      userId: gData.id
    },(res)=>{
      console.log('POST--room/quit',res);
    });
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '房间已开好，就等你了。房间号：'+ roomId,
      path: '/pages/login/login?enterRoom=true&roomId='+roomId+'&maxNum='+maxNum,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})