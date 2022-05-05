//index.js
//获取应用实例
var util = require('../../utils/util.js');
var that, latitude, longitude, idgitude, ctrlOption, scrollLeft, loadValue, alermArea, tempElements = [], tempElement = [],myProvince;
var circleScale=5, circleNum = 0, circleTop = 0,startClient,endCircleTimer = null;
Page({
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
    this.setData({
      scrollLeft: 0,
      boxLeft:0,
      circlePos:{},
      loading: false,
    })
    util.chartImg('clear');
    circleNum = 0;
    circleTop = 0;
    endCircleTimer = null;
    clearTimeout(endCircleTimer);
    this.onLoad(ctrlOption);
  },
  //事件处理函数
  jumpEvent: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  jumpTen: function(e) {
    console.log()
    var dataIndex = e.currentTarget.dataset.index !==undefined ? '&index=' + e.currentTarget.dataset.index:'';
    wx.navigateTo({
      url: '../logs/logs?lon=' + longitude + '&lat=' + latitude + dataIndex
    })
  },
  jumpAlerm:function(){
    wx.navigateTo({
      url: '../alerm/alerm'
    })
  },
  cirleStart:function(event){
    clearTimeout(endCircleTimer);
    startClient = event.touches[0].clientY;
  },
  cirleMove:function(event){
    var nowClient = event.touches[0].clientY;
    circleTop = circleTop + nowClient - startClient;
    if ((circleNum === 0 && circleTop >= 46 * circleScale) || (circleNum === 7 && circleTop <= -46 * circleScale)){
      startClient = nowClient;
      circleTop = circleTop > 0 ? 46 * circleScale : -46 * circleScale;
      util.circle(that, circleTop);
      return false;
    }
    if (circleTop >= 110 * circleScale || circleTop <= -110 * circleScale){
      circleNum = circleTop > 0 ? circleNum - 1 : circleNum + 1;
      startClient = nowClient;
      circleTop = 0;
      util.circle(that, circleTop);
      tempElement = tempElements.slice(circleNum, circleNum+7);
      that.setData({
        tempElement: tempElement
      })
      return false;
    }
    util.circle(that, circleTop);
    console.log(event);

  },
  cirleEnd:function(event){
   // console.log(event);
    var addOrMinus = (circleTop > 0 && circleTop < 55 * circleScale || circleTop < -55 * circleScale) ? -8 * circleScale : 8 * circleScale;
    var changeOrNo = circleTop > 55 * circleScale?-1:0;
    changeOrNo = circleTop < -55 * circleScale ? 1 : changeOrNo;
  var exec = function(){
    clearTimeout(endCircleTimer);
    circleTop = circleTop + addOrMinus;
    if ((changeOrNo === 0 && addOrMinus > 0 && circleTop > 0) || (changeOrNo === 0 && addOrMinus < 0 && circleTop < 0) || (changeOrNo === 1 && circleTop < -110 * circleScale) || (changeOrNo === -1 && circleTop > 110 * circleScale)){
      circleTop = 0;
      util.circle(that, circleTop);
      circleNum = circleNum + changeOrNo;
      tempElement = tempElements.slice(circleNum, circleNum + 7);
      that.setData({
        tempElement: tempElement
      })
      return false;
    } 
    util.circle(that, circleTop);
    endCircleTimer = setTimeout(exec, 30);
  }
  exec();
  },
   onLoad: function (option) {
     that = this;
     ctrlOption = option;
     var scenicUrl;
     var nowUrl = '';
     loadValue= 7;
     var loadHidden = function(){
       loadValue -= 1;
       if (loadValue === 0) {
         that.setData({
           loading: true
         })
       }
     }
     var getAreaName = function(scenic){
       if(scenic){
         scenicUrl = 'https://bjwx.91weather.com/bjwx/app/scenic/realtime?scenicId='+idgitude;
         nowUrl = 'https://bjwx.91weather.com/bjwx/app/realtime?lon=' + longitude + '&lat=' + latitude;
       }else{
         nowUrl = 'https://bjwx.91weather.com/bjwx/app/realtime?lon='+longitude+'&lat='+latitude;
       }
       wx.request({
          url:  'https://bjwx.91weather.com/bjwx/baidu/v3/geocode/regeo?key=762b7eea61e352b2a1761ae9f4345092&s=rsv3&location='+longitude+','+latitude, 
          success: function(res){
            console.log(res)
            loadHidden();
            alermArea = (res.data.regeocode.addressComponent.district).replace("区","");
            myProvince = res.data.regeocode.addressComponent.province;
            var province = res.data.regeocode.addressComponent.district||res.data.regeocode.addressComponent.province;
            var logs = res.data.regeocode.formatted_address;
            util.chartImg(logs, that, 480, 2.4, 1);
            that.setData({
              logs:logs
            })
          },
          fail: function(res) {
            loadHidden();
          }
        })
        wx.request({
          url: 'https://bjwx.91weather.com/bjwx/app/forecast/hour?lon='+longitude+'&lat='+latitude,
          success: function(res){
            loadHidden();
            tempElements = [];
            if (res && res.data && res.data.detail){
              var data = res.data.detail;
              for(var key in data){
                for(var ke in data[key]){
                  for(var k in data[key][ke]){
                    if (tempElements.length < 12){
                      var tempElementOne = {};
                      tempElementOne.date = data[key][ke][k].time.substring(8,10)+'点';
                      var imageTitle = data[key][ke][k].time && (data[key][ke][k].time.substring(8, 10) * 1 < 8 || data[key][ke][k].time.substring(8, 10) * 1 >= 20) && (data[key][ke][k].weatherCode === 0 || data[key][ke][k].weatherCode === 1 || data[key][ke][k].weatherCode === 3 || data[key][ke][k].weatherCode === 13) ? 'qs-weathern' : 'qs-weather';
                      tempElementOne.logo = imageTitle+data[key][ke][k].weatherCode;
                      tempElementOne.temp = data[key][ke][k].temp+'℃';
                      var myDate = new Date(data[key][ke][k].time.substring(0,4),data[key][ke][k].time.substring(4,6)-1,data[key][ke][k].time.substring(6,8));
                      tempElementOne.week = util.numberToText(myDate.getDay());
                      tempElementOne.wd = data[key][ke][k].windDir;
                      tempElementOne.wl = data[key][ke][k].windLevel;
                      tempElements.push(tempElementOne);
                    }
                  }           
                }
              }
            }
            tempElements.push();
            tempElements.unshift({ add: 0 });
            tempElement = tempElements.slice(0,7);
             that.setData({
              tempElement: tempElement
            })
          },
          fail: function(res) {
            loadHidden();
          }
        })
        wx.request({
          url: 'https://bjwx.91weather.com/bjwx/app/forecast/day?lon='+longitude+'&lat='+latitude,
          success: function(res){
            loadHidden();
            var featureFour=[];
            if (res && res.data && res.data.detail){
              var dayData = res.data.detail;
              for(var key in dayData){
                if (util.getTime(new Date()).substring(0, 8) === dayData[key].time){
                  continue;
                }
                var featurOne = {};
                featurOne.date = dayData[key].time.substring(4,6)+'月'+dayData[key].time.substring(6,8)+'日';
                featurOne.logo = 'qs-weather'+dayData[key].weatherCode;
                featurOne.temp = util.handleTemp(dayData[key].minTemp, dayData[key].maxTemp);
                featureFour.push(featurOne);
              } 
            }
            that.setData({
              featureFour:featureFour
            })      
          },
          fail: function(res) {
            loadHidden();
          }
        })
       wx.request({
         url: scenicUrl,
         success: function (res) {
           loadHidden();
           console.log("lilaoa", res)
           var nowWind = res && res.data && res.data.detail ? util.handleWind(res.data.detail.windDir, res.data.detail.windLevel) : '';
           var nowRh = '湿度 ' + (res && res.data && res.data.detail && res.data.detail.humidity && Math.round(res.data.detail.humidity) || '- ') + '%';
           var htmlBgimage = res && res.data && res.data.detail && res.data.detail.backImage ? res.data.detail.backImage : '';
           var nowTemp = res && res.data && res.data.detail && res.data.detail.temp !== undefined ? res.data.detail.temp : '--';
           var nowWeather = res && res.data && res.data.detail && res.data.detail.weather ? '未来一小时' + res.data.detail.weather : '';
           var clothesElement = [];
           that.setData({
             nowTemp: nowTemp,
             nowWeather: nowWeather,
             htmlBgimage: htmlBgimage,
             nowWind: nowWind,
             nowRh: nowRh
           })
           //负离子指数
           var anionLogo = scenic && res && res.data && res.data.detail && res.data.detail.anionInfo && res.data.detail.anion > 0 && res.data.detail.anion < 3 ? 'qs-flz1' : '';
           anionLogo = scenic && res && res.data && res.data.detail && res.data.detail.anionInfo && res.data.detail.anion > 2 && res.data.detail.anion < 4 ? 'qs-flz2' : anionLogo;
           anionLogo = scenic && res && res.data && res.data.detail && res.data.detail.anionInfo && res.data.detail.anion > 3 ? 'qs-flz3' : anionLogo;
           var anionText = scenic && res && res.data && res.data.detail && res.data.detail.anionLevel !== undefined && res.data.detail.anionInfo ? '负离子' + res.data.detail.anionLevel + ' ' + res.data.detail.anionInfo : '';
           anionText = scenic && res && res.data && res.data.detail && res.data.detail.anionLevel !== undefined && !res.data.detail.anionInfo ? '负离子' + res.data.detail.anionLevel : anionText;
           anionText = scenic && res && res.data && res.data.detail && res.data.detail.anionLevel === undefined && res.data.detail.anionInfo ? res.data.detail.anionInfo : anionText;
           var anionValue = { logo: anionLogo, text: anionText };
           (anionValue.logo || anionValue.text) && clothesElement.push(anionValue);
           wx.request({
             url: 'https://bjwx.91weather.com/bjwx/app/index?lon=' + longitude + '&lat=' + latitude,
             success: function (res) {
               loadHidden();
               var dressValue = util.handleNumber(res, 'dress', [0, 4, 3, 6, 5, 'qs-cyzs']); //穿衣指数
               (dressValue.logo || dressValue.text) && clothesElement.push(dressValue);
               var uvValue = util.handleNumber(res, 'uv', [0, 3, 2, 4, 3, 'qs-zwx']);//紫外线指数
               (uvValue.logo || uvValue.text) && clothesElement.push(uvValue);
               var nowMonth = new Date().getMonth();//舒适度指数
               var nowMonthValue = nowMonth > 2 && nowMonth < 10 ? [-1, 3, 2, 7, 6, 'qs-ssd'] : [-1, 2, 1, 6, 5, 'qs-fhzs'];
               var comfortValue = util.handleNumber(res, 'comfort', nowMonthValue);
               (comfortValue.logo || comfortValue.text) && clothesElement.push(comfortValue);
               var travelValue = util.handleNumber(res, 'travel', [0, 3, 2, 4, 3, 'qs-lyzs']); //旅游指数
               scenic && (travelValue.logo || travelValue.text) && clothesElement.push(travelValue);
               that.setData({
                 clothesElement: clothesElement
               })
             },
             fail: function (res) {
               loadHidden();
             }
           })
         },
         fail: function (res) {
           loadHidden();
         }
       });
       wx.request({
         url: nowUrl,
         success: function (res) {
           loadHidden();
           var nowRain = '降水 ' + (res && res.data && res.data.detail && res.data.detail.rain && res.data.detail.rain >= 0.1 ? (res.data.detail.rain + 'mm') : '无');
           that.setData({
             nowRain: nowRain
           });
         },
         fail: function (res) {
           loadHidden();
         }
       });
        wx.request({
          url: 'https://bjwx.91weather.com/bjwx/app/alarm',
          data: {city:alermArea},
          success: function(res){
            loadHidden();
            if(res.data.detail.length > 0){
              that.setData({
                alermLogo:true
              })
            }
          },
          fail: function(res) {
            loadValue -= 1;
            if(loadValue === 0){
              that.setData({
                loading:true
              })
            }
          }
  
        })
        wx.request({
          url: 'https://bjwx.91weather.com/bjwx/app/forecast/time',
          success: function(res){
            loadHidden();
            var upDateTime = res && res.data&&res.data.detail ? '更新时间: '+res.data.detail.substring(4,6)+'月'+res.data.detail.substring(6,8)+'日 '+res.data.detail.substring(8,10)+':'+res.data.detail.substring(10,12):'更新时间:暂无数据';
            that.setData({
              upDateTime:upDateTime
            })
          },
          fail: function(res) {
            loadHidden();
          }
        })

     }
     console.log(option)
     if (option.id && option.id!=="undefined"){
        latitude = option.lat;
        longitude = option.lon;
        idgitude = option.id;
        getAreaName("scenic");
     } else if (option.id === "undefined"){
       latitude = option.lat;
       longitude = option.lon;
       idgitude = undefined;
       getAreaName();
     }else{
        wx.getLocation({
          type: 'wgs84',
          success: function(res) {
            console.log(res)
            latitude = res.latitude;
            longitude = res.longitude;
            idgitude = undefined;
            getAreaName();
          },
          fail: function (res) {
            latitude = "39.90960456049752";
            longitude = "116.3972282409668";
            idgitude = undefined;
            getAreaName();
          }
        })
     }
  }
})
