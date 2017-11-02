var position = 0;//номер элемента, с которого выводим список пользователю
var weather_prediction = [];//массив с готовыми элементами списка(прогнозами)
var location_w = "Paris";//город, прогноз которого в данный момент смотрим
var delay = 1000 * 600;//задержка между обновлениями страницы


function templater(html) {
            return function(data) {
                for (var x in data) {
                    var re = "{{\\s?" + x + "\\s?}}";
                    html = html.replace(new RegExp(re, "ig"), data[x]);
                }
                return html;
            };
        };

function createListItem(data){
  var elem = document.createElement("li");
  var template = '<span>{{day}}</span>\
  <i class="icon_lp {{weather}}"></i>\
  <span> {{temp}}°</span>';
  template = templater(template)(data);
  elem.innerHTML = template;
  return elem;
};

function createList(data){
  weather_prediction = [];
  data.forEach(function(el){
    weather_prediction.push(createListItem(el));

  });
  position = 0;
  viewList()
}

function viewList(){
  var list = document.querySelector(".widget_paris_sidebar_list_predictions");
  list.innerHTML = "";
  for(var i = position; i < position + 4; i++){
    list.appendChild(weather_prediction[i]);
  }
}

function editWeatherInfobar({date,temp,loc,wind_speed}){
  var day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var infobar = document.querySelector(".widget_paris_weather_infobar");
  document.querySelector(".widget_paris_span_day_of_week").innerHTML = day[date.getDay()];
  document.querySelector(".widget_paris_span_date").innerHTML = month[date.getMonth()] + ", " + date.getDate().toString();
  document.querySelector(".widget_paris_span_temp").innerHTML = temp.toString() + "°";
  document.querySelector(".widget_paris_span_location").innerHTML = loc;
  document.querySelector(".widget_paris_span_wind_speed").innerHTML = '<i class="icon_wind"></i>' + wind_speed.toString();
};

function getWeather(loc){
  var params = "q=" + loc + "&appid=" + "600ffdc37498bdbf0addcd68c0a9b0a9";
  var xhr = new XMLHttpRequest();
  xhr.open('GET','http://api.openweathermap.org/data/2.5/forecast?' + params);
  xhr.send();
  xhr.onreadystatechange = function(){
    if (xhr.readyState !== 4) return;
    if(xhr.status !== 200){
      alert(xhr.status + ":" + xhr.statusText);
      return;
    }
    else{
      //alert(xhr.responseText);
      location_w = loc;
      var data = JSON.parse(xhr.responseText);
      var infobarData = {
        date: new Date(),
        temp: Math.round(data.list[0].main["temp"] - 273) ,
        loc: data.city.name + ", " + data.city.country,
        wind_speed: Math.round(data.list[0]["wind"]["speed"])
      };

      var predictionListData = [];
      var re = "[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2} 12:00:00";
      var regex = new RegExp(re,"ig");
      var day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      var weather  = {
        Clouds: "cloudy",
        Clear: "sunny",
        Rain: "rain"
      };
      for(var i = 1; i < data.list.length; i++){
          if(regex.test(data.list[i].dt_txt)){
            let daily_day = new Date(data.list[i].dt_txt);
            //alert(JSON.stringify(data.list[i]));
            let temp_data = { day: day[daily_day.getDay()],
              weather: weather[data.list[i].weather[0].main],
              temp: Math.round(data.list[i].main.temp - 273)
            };
            //alert(temp_data.temp);
            predictionListData.push(temp_data)
          }
      }
      editWeatherInfobar(infobarData);
      createList(predictionListData);
    }
  };

}

function getWeatherinput(){
  getWeather(document.querySelector(".widget_paris_search_input").value);
}
// init
document.querySelector(".widget_paris_search_button").addEventListener("click",getWeatherinput);
document.querySelector(".widget_paris_search_input").oninput = function(){
  if(this.value.length < 3) return;
  var params = "q=" + this.value + "&appid=" + "600ffdc37498bdbf0addcd68c0a9b0a9";
  var xhr = new XMLHttpRequest();
  xhr.open('GET','http://api.openweathermap.org/data/2.5/find?type=like&' + params);
  xhr.send();
  xhr.onreadystatechange = function(){
    if (xhr.readyState !== 4) return;
    if(xhr.status !== 200){
      alert(xhr.status + ":" + xhr.statusText);
    }
    else{
      var data = JSON.parse(xhr.responseText);
      var autocomp = document.getElementById("autocomplist");
      autocomp.innerHTML = "";
      data.list.forEach(function(el){
        var option = document.createElement('option');
        option.value = el.name + "," + el.sys.country;
        autocomp.appendChild(option);
      });
    }
  };
};

document.querySelector(".widget_paris_button_prev").onclick = function(){
  if (position <= 0) return;
  position-=1;
  viewList();
}

document.querySelector(".widget_paris_button_next").onclick = function(){
  if (position >= weather_prediction.length - 4) return;
  position+=1;
  viewList();
}

getWeather(location_w);

setTimeout(function rec()
  {
    getWeather(location_w);
    setTimeout(rec,delay)
  }, delay);
