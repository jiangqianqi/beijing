function getTime(nDate) {
  var nDateYear = nDate.getFullYear() + '';
  var nDateMonth = nDate.getMonth() + 1 > 9 ? nDate.getMonth() + 1 + '' : '0' + (nDate.getMonth() + 1);
  var nDateDay = nDate.getDate() > 9 ? nDate.getDate() + '' : '0' + nDate.getDate();
  var nDateHours = nDate.getHours() > 9 ? nDate.getHours() + '' : '0' + nDate.getHours();
  var nDateMinutes = nDate.getMinutes() > 9 ? nDate.getMinutes() + '' : '0' + nDate.getMinutes();
  var newDate = nDateYear + nDateMonth + nDateDay + nDateHours + nDateMinutes + '00';
  return newDate;
}

function numberToText(number){
    var text;
    switch(number){
        case 0:
        text = "星期日";
        break;
        case 1:
        text = "星期一";
        break;
        case 2:
        text = "星期二";
        break;
        case 3:
        text = "星期三";
        break;
        case 4:
        text = "星期四";
        break;
        case 5:
        text = "星期五";
        break;
        case 6:
        text = "星期六";
        break;
    }
    return text;
}
function handleWind(wd,ws){
  var myWind = wd && !ws ? wd : '暂无数据';
  myWind = !wd && ws ? ws : myWind;
  myWind = wd && ws ? wd + ' ' + ws : myWind;
  myWind = ws === '微风' ? '微风' : myWind;
  myWind = ws === '无风' ? '无风' : myWind;
  myWind = wd && ws.indexOf('级') !== -1 ? wd + ' ' + ws.replace("风", "") : myWind;
  return myWind;
}
function handleWeather(weather,weatherAm,weatherPm){
  var myWeather = weatherAm && weatherPm && weatherPm !== weatherAm ? weatherAm + '转' + weatherPm:'';
  myWeather = weatherAm && weatherPm && weatherPm === weatherAm ? weatherAm : myWeather;
  myWeather = weatherAm && !weatherPm ? weatherAm : myWeather;
  myWeather = !weatherAm && weatherPm ? weatherPm : myWeather;
  myWeather = !weatherAm && !weatherPm && weather ? weather : myWeather;
  return myWeather;
}
function handleTemp(tempMin,tempMax){
  var Temp = tempMin === undefined && tempMax !== undefined ? tempMax+'℃':'--℃';
  Temp = tempMin !== undefined && tempMax === undefined ? tempMin + '℃' : Temp;
  Temp = tempMin !== undefined && tempMax !== undefined && tempMin === tempMax ? tempMax + '℃' : Temp;
  Temp = tempMin !== undefined && tempMax !== undefined && tempMin !== tempMax ? tempMin + '~'+ tempMax + '℃' : Temp;
  return Temp;
}
function handleNumber(res,whichEle,whichArr) {
  var Logo = res && res.data && res.data.detail && res.data.detail[whichEle] !== undefined && res.data.detail[whichEle] > whichArr[0] && res.data.detail[whichEle] < whichArr[1] ? whichArr[5] + 1 : '';
  Logo = res && res.data && res.data.detail && res.data.detail[whichEle] && res.data.detail[whichEle] > whichArr[2] && res.data.detail[whichEle] < whichArr[3] ? whichArr[5] + 2 : Logo;
  Logo = res && res.data && res.data.detail && res.data.detail[whichEle] && res.data.detail[whichEle] > whichArr[4] ? whichArr[5] + 3 : Logo;
  var Text = res && res.data && res.data.detail && res.data.detail[whichEle + 'Info'] ? res.data.detail[whichEle + 'Info'] : '';
  if (whichEle === 'comfort') {
    console.log('comfort: ', res.data.detail);
  }
  var Value = { logo: Logo, text: Text };
  return Value;
}
var clear = 'noClear';
function chartImg(logs, that, boxLength, oneLength){
  var _timer = null;
  clearTimeout(_timer);
  if (logs === 'clear'){
    clear = 'clear';
    return false;
  }
  clear = 'noClear';
  var visibleFrameWidth = (logs.length+1)*28+10;
  var BoxFrameWidth = visibleFrameWidth + boxLength;
  var BoxnatureWidth = Math.ceil(BoxFrameWidth / oneLength) * oneLength;
  var visibleNatureWidth = BoxnatureWidth - boxLength > 480 ? BoxnatureWidth - boxLength:480;
  that.setData({
    visiLength: visibleNatureWidth,
    boxLength: BoxnatureWidth
  });
  if (visibleNatureWidth === 480){
    return false;
  }
  var _left = 0;
  var exec = function () {
    clearTimeout(_timer);
    _left = (_left <= (-1*visibleNatureWidth) ? 0 : _left);
    _left -= oneLength;
    that.setData({
      boxLeft: _left
    });
    _timer = setTimeout(function () { if (clear === 'noClear') {exec()}}, 40);
  };
  exec();
}

//给首页转盘上的数据设置position位置；
var circlePos = [[-1000, 554], [22, 634], [132, 690], [242, 726], [352, 690], [462, 634], [572, 554]];
var circlePosBottom = [[1, 0.727273], [1, 0.509091], [1, 0.327273], [1, -0.327273], [1, -0.509091], [1, -0.727273], [1, 0]];
var circlePosTop = [[1, 0], [1, 0.727273], [1, 0.509091], [1, 0.327273], [1, -0.327273], [1, -0.509091], [1, -0.727273]];
function circle(that,num){
  console.log(num)
  num = num/5
  var circlePosDirect = num >= 0 ? circlePosBottom : circlePosTop;
  var nowCirclePos = [[],[],[],[],[],[],[]];
  for (var i = 0; i < circlePosTop.length; i++){
    nowCirclePos[i][0] = circlePos[i][0] + num * circlePosDirect[i][0];
    nowCirclePos[i][1] = circlePos[i][1] + num * circlePosDirect[i][1];
  }
  that.setData({
    circlePos: nowCirclePos
  })
}

module.exports = {
  numberToText: numberToText,
  handleWind: handleWind,
  handleNumber: handleNumber,
  handleTemp: handleTemp,
  getTime: getTime,
  handleWeather: handleWeather,
  chartImg: chartImg,
  circle: circle
}