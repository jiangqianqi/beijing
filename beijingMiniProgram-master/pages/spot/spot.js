//spot.js
var searchTime, giveCountry = [], country = [], myProvince,ctrlOption,that;
var loadHidden = function () {
  that.setData({
    loading: true
  })
}
var loadShow = function () {
  that.setData({
    loading: false
  })
}
//获取搜索到的景点的数据
var getDataList = function(value){
  loadShow();
  country = [];
  wx.request({
    url: 'https://bjwx.91weather.com/bjwx/app/scenic/search',
    data: { key: value },
    success: function (res) {
      for (var i = 0; i < res.data.detail.length; i++) {
        var countryOne = {};
        countryOne.id = res.data.detail[i].id;
        countryOne.lon = res.data.detail[i].lon;
        countryOne.lat = res.data.detail[i].lat;
        countryOne.name = res.data.detail[i].name;
        countryOne.pic = res.data.detail[i].pic;
        country.push(countryOne);
      }
      wx.request({
        url: 'https://bjwx.91weather.com/bjwx/baidu/v3/place/text?' + '&city=' + myProvince +'&offset=10&page=1&key=86e3f2742d61b3fa70e8fdc767ef2032&extensions=all',
        data: { keywords: value },
        success:function(ress){
          loadHidden();
          console.log(ress)
          console.log('https://bjwx.91weather.com/bjwx/baidu/v3/place/text?&keywords=' + value + '&city=' + myProvince + '&offset=10&page=1&key=86e3f2742d61b3fa70e8fdc767ef2032')
          if (ress&&ress.data&&ress.data.pois){
            for (var i = 0; i < ress.data.pois.length; i++){
              if (ress.data.pois[i].name.length > 0 && ress.data.pois[i].location.length > 0){
                var countryOne = {};
                countryOne.lon = ress.data.pois[i].location.split(",")[0];
                countryOne.lat = ress.data.pois[i].location.split(",")[1];
                countryOne.name = ress.data.pois[i].name;
                country.push(countryOne);
              }
            }
          }
          that.setData({
            country: country
          })
        },
        fail: function (res) {
          loadHidden();
        }
      })
    }
  })
}
Page({
  data: {
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
    loadShow();
    this.onLoad(ctrlOption);
  },
  inputChange:function(event){
    searchTime = event.timeStamp;
    setTimeout(function(){
      if (searchTime === event.timeStamp){
        var value = event.detail.value;
        if(!value){
          console.log(value)
          that.setData({
            giveCountryObj:giveCountry,
            country:[]
          })
        }else{
          that.setData({
            giveCountryObj:""
          })
          getDataList(value);
        }
      }
    } ,500)
  },
  onLoad:function(option){
    ctrlOption = option;
    that = this;
    myProvince = option.province === "北京市"?'beijing':'hebei';
    myProvince = option.province === "天津市" ? 'tianjin' : myProvince;    
    console.log(myProvince);
    wx.request({
      url: 'https://bjwx.91weather.com/bjwx/app/scenic',
      success: function(res){
         that.setData({
           loading:true
         })
         console.log(res)
         giveCountry = [];
         for(var i = 0;i<res.data.detail.length;i++){
            var giveCountryObj={};
            giveCountryObj.id=res.data.detail[i].id;
            giveCountryObj.lon=res.data.detail[i].lon;
            giveCountryObj.lat=res.data.detail[i].lat;
            giveCountryObj.name=res.data.detail[i].name;
            giveCountryObj.pic=res.data.detail[i].pic;
            giveCountry.push(giveCountryObj);
          }
          that.setData({
            giveCountryObj:giveCountry,
            country:[],
            inputVal: ""
          })
      },
      fail: function(res) {
        that.setData({
           loading:true
         })
      }    
    })
  },
  noEvent:function(e){
    console.log(e.currentTarget.dataset.id,e.currentTarget.dataset.lon,e.currentTarget.dataset.lat)
    that.setData({
      inputVal: "",
      giveCountryObj: giveCountry,
      country: []
    })
    wx.navigateTo({
      url: '../indexs/indexs?lon='+e.currentTarget.dataset.lon+'&lat='+e.currentTarget.dataset.lat+'&id='+e.currentTarget.dataset.id
    })
  },
  returnMyPosition:function(e){
    that.setData({
      inputVal: "",
      giveCountryObj: giveCountry,
      country: []
    })
    wx.navigateTo({
      url: '../index/index'
    })
  }
  
})
