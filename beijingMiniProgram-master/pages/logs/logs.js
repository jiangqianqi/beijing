//logs.js
var util = require('../../utils/util.js');
var that, latitude, longitude, loadValue, dataIndex, ctrlOption;
Page({
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
     that.setData({
      loading: false,
    }) 
    this.onLoad(ctrlOption);
  },
  onLoad: function (option) {
    ctrlOption = option;
    dataIndex = option.index === 'undefined' ? 'undefined' : option.index*1;
    var loadHidden = function () {
      loadValue -= 1;
      if (loadValue === 0) {
        that.setData({
          loading: true
        })
      }
    }
    longitude = option.lon;
    latitude = option.lat;
    var dayBox = [], loadValue = 2;
    that = this;
    wx.request({
      url: 'https://bjwx.91weather.com/bjwx/app/forecast/day?lon=' + longitude + '&lat=' + latitude,
      success: function (res) {
        loadHidden();
        if (res && res.data && res.data.detail) {
          var dayData = res.data.detail;
          for (var key in dayData) {
            if (util.getTime(new Date()).substring(0, 8) === dayData[key].time) {
              continue;
            }
            var featurOne = {};
            var myDate = new Date(dayData[key].time.substring(0, 4), dayData[key].time.substring(4, 6) - 1, dayData[key].time.substring(6, 8));
            featurOne.date = dayData[key].time.substring(4, 6) + '月' + dayData[key].time.substring(6, 8) + '日';
            featurOne.week = util.numberToText(myDate.getDay());
            var pmImageTitle = dayData[key].weatherPmCode === 0 || dayData[key].weatherPmCode === 1 || dayData[key].weatherPmCode === 3 || dayData[key].weatherPmCode === 13 ? 'qs-weathern' : 'qs-weather'
            featurOne.pmImage = pmImageTitle + dayData[key].weatherPmCode;
            featurOne.amImage = 'qs-weather' + dayData[key].weatherAmCode;  
            featurOne.weather = util.handleWeather(dayData[key].weather, dayData[key].weatherAm, dayData[key].weatherPm);
            featurOne.temp = util.handleTemp(dayData[key].minTemp, dayData[key].maxTemp);
            featurOne.wind = util.handleWind(dayData[key].windDir, dayData[key].windLevel);
            dayBox.push(featurOne);
          }
        }
        console.log(dayBox);
        that.setData({
          dayBox: dayBox,
          dataIndex: dataIndex
        })
      },
      fail: function (res) {
        loadHidden();
      }
    })

    wx.request({
      url: 'https://bjwx.91weather.com/bjwx/app/forecast/hour?lon='+longitude+'&lat='+latitude,
      success: function (res) {
        loadHidden();
        var hourBox = [];
        console.log(123)
        if (res && res.data && res.data.detail) {
          var hourData = res.data.detail;
          for (var i = 0; i < hourData.length; i++){
            for (var key in hourData[i]){
              if (util.getTime(new Date()).substring(0, 8) !== key) {
                var hourOneList = [];
                var hourOneLength = 0;
                for (var j = 0; j < hourData[i][key].length ; j ++){
                  var houOne = {};
                  var startTime = hourData[i][key][j].start ? hourData[i][key][j].start.substring(8, 10) + ':' + hourData[i][key][j].start.substring(10, 12):'';
                  var endTime = hourData[i][key][j].time ? hourData[i][key][j].time.substring(8, 10) + ':' + hourData[i][key][j].time.substring(10, 12): '';
                  var startToEnd = startTime && endTime? '~' : '';
                  houOne.time = startTime + startToEnd + endTime;
                  var imageTitle = startTime && (startTime.substring(0, 2) * 1 < 8 || startTime.substring(0, 2) * 1 >= 20) && (hourData[i][key][j].weatherCode === 0 || hourData[i][key][j].weatherCode === 1 || hourData[i][key][j].weatherCode === 3 || hourData[i][key][j].weatherCode === 13)? 'qs-weathern' : 'qs-weather';
                  houOne.image = imageTitle + hourData[i][key][j].weatherCode;
                  houOne.weather = hourData[i][key][j].weather ? hourData[i][key][j].weather:'';
                  houOne.temp = hourData[i][key][j].temp !== undefined ? hourData[i][key][j].temp + '℃':'';
                  houOne.wind = util.handleWind(hourData[i][key][j].windDir, hourData[i][key][j].windLevel);
                  hourOneLength = houOne.weather.length > hourOneLength ? houOne.weather.length : hourOneLength;
                  houOne.length = hourOneLength;
                  hourOneList.push(houOne);
                }
              }
            }
            hourOneList&&hourBox.push(hourOneList);  
          }
          console.log(hourBox)
          that.setData({
            hourBox: hourBox
          })
        } 
      },
      fail: function (res) {
        loadHidden();
      }
    }) 
   
  },

  developFold:function(e){
    console.log(dataIndex)
    console.log(e.currentTarget.dataset.index)
    dataIndex = e.currentTarget.dataset.index !== dataIndex ? e.currentTarget.dataset.index:'undefined';
    console.log(dataIndex)
    that.setData({
      dataIndex: dataIndex
    })
  }
})
