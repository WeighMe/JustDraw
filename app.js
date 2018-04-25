//app.js
var util = require('/utils/util.js');
App({
  
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey
        if (res.code) {
          var vcode=res.code;
          var that=this;
          wx.getUserInfo({
            success: function (res) {
              console.log({ encryptedData: res.encryptedData, iv: res.iv, code: vcode })
              //3.解密用户信息 获取unionId
              wx.request({
                url: 'http://101.200.62.252:8080/decryption/decodeUserInfo',
                data: { 
                  encryptedData: res.encryptedData,
                  iv: res.iv, 
                  code: vcode 
                },
                method:"POST", 
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                dataType: 'json',
                responseType: 'text',
                success:function(data){
            
                  console.log(data);
                  if (data.data.status == 1) {
                    var u = data.data.userInfo;
                    
                    that.globalData.user = new util.user(u.openId,u.nickName,u.avatarUrl);
                    that.globalData.id = u.openId;

                    if (!that.isRegistered()) {
                      that.register();
                    }
                  } else {
                    console.log('解密失败');
                  }
                },
                fail: function () {
                  console.log('系统错误')
                }
              })
              //...
            },
            fail: function () {
              console.log('获取用户信息失败')
            }
          })
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        //判断用户是否注册，若未注册先注册用户
        
       

        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              var u = res.userInfo;
              this.globalData.icon = res.userInfo.avatarUrl
              this.globalData.name = res.userInfo.nickName
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
      
    })
  },

  isRegistered:function(){
    console.log("globalData.id:", this.globalData.id)
    var that=this;
    wx.request({
      url: 'http://101.200.62.252:8080/user/isRegistered',
      data: {
        userId:that.globalData.id
      },
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      dataType: 'json',
      responseType: 'text',
      success: function (data) {
        console.log("GET--userId:",data);
        if(data.data.info=="YES"){
          return true;
        }else{
          return false;
        }
      }
    }) 
  },

  register:function(){
    var that = this;
    wx.request({
      url: 'http://101.200.62.252:8080/user/register',
      data: {
        userId: that.globalData.id,
        nickName:that.globalData.name,
        photo: that.globalData.icon
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      responseType: 'text',
      success: function (data) {
        console.log("POST--register:", data);
        
      }
    })
  },

  globalData: {
    user: null,
    id:1,
    icon:"",
    name:""
  }
})