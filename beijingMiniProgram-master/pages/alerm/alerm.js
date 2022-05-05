//spot.js
Page({
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
  },
  onShow() {
    var app = getApp();
    app.globalData.alerts.forEach(item => {
      item.time = item.time.substring(5, 7) + '月' + item.time.substring(8, 10) + '日 ' + item.time.substring(11, 16);
    });
    this.setData({
      alerts: app.globalData.alerts
    });
  },
  onLoad:function(option){
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          subHeight: res.windowHeight - 320
        })
      }
    });
    var colorMap = {
      '蓝色': '#0000ff',
      '黄色': '#ffff00',
      '橙色': '#ffa500',
      '红色': '#ff0000'
    };
    let districtList = ['北京市气象台', '海淀', '朝阳', '昌平', '大兴', '石景山', '延庆', '丰台', '密云', '房山', '怀柔', '通州', '平谷', '顺义', '门头沟'];
    let alertList = [];
    for (var i = 0, len = districtList.length; i < len; i++) {
      wx.request({
        url: 'https://bjwx.91weather.com/bjwx/app/alarm?city=' + districtList[i],
        success: function (res) {
          if (res && res.data && res.data.detail && res.data.detail.length > 0) {
            let item = res.data.detail[0];
            item.color = colorMap[item.level];
            item.time = item.time.substring(5, 7) + '月' + item.time.substring(8, 10) + '日 ' + item.time.substring(11, 16);
            item.title = item.reporter.replace('气象台', '') + '/' + item.title;
            alertList.push(item);
            that.setData({
              subAlerts: alertList
            });
          }
        }
      });
    }
  },
})
