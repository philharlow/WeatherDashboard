// WeatherDashboard


function isValidKey(val)
{
	return val !== null && val.length > 0;
}

let searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('reset'))
{
	window.localStorage.setItem('apiKey', '');
	window.localStorage.setItem('latitude', '');
	window.localStorage.setItem('longitude', '');
}

let apiKey = window.localStorage.getItem('apiKey');
let latitude = window.localStorage.getItem('latitude');
let longitude = window.localStorage.getItem('longitude');

function tryLoad()
{
	if (isValidKey(apiKey) && isValidKey(latitude) && isValidKey(longitude))
	{
		init()
		return true;
	}
	else
		return false;
}

if (tryLoad() === false)
{
	apiKey = prompt("Enter DarkSky API Key:");
	latitude = prompt("Enter latitude:");
	longitude = prompt("Enter longitude:");
	
	window.localStorage.setItem('apiKey', apiKey);
	window.localStorage.setItem('latitude', latitude);
	window.localStorage.setItem('longitude', longitude);
	if (tryLoad())
		alert("Saved! Use ?reset if you need to reinput the data");
	else
		alert("Invalid data! Reload the page to try again.");
}



function init() {
    var skycons = new Skycons({ "color": "white" });

	var waitBetweenWeatherQueriesMS = 900000;

    function replaceAll(str, find, replace)
    {
        return str.replace(new RegExp(find, 'g'), replace);
    }
	
	var iconCanvases = $(".icon");
    
    var tempRangeMax;
    var tempRangeMin;
    var tempRangeSpan = tempRangeMax - tempRangeMin;
    var currentTemp;
    
    function updateTempRange(results, currently)
    {
        currentTemp = currently.temperature
        tempRangeMax = Math.max(80, currentTemp);
        tempRangeMin = Math.min(40, currentTemp);
        for (var i = 0; i < 5; i++)
        {
            tempRangeMax = Math.max(tempRangeMax, results[i].temperatureHigh);
            tempRangeMin = Math.min(tempRangeMin, results[i].temperatureLow);
        }

        tempRangeSpan = Math.round(tempRangeMax - tempRangeMin);
        $('.topTemp').html(Math.round(tempRangeMax));
        $('.bottomTemp').html(Math.round(tempRangeMin));
    }
    
    function getTempPercentage(temp)
    {
        return Math.round((temp - tempRangeMin) / tempRangeSpan * 100);
    }
    function getGradient(low, high, color, weekend)
    {
        var bgColor = /*weekend ? "#202020" :*/ "#000000";
        var css = "linear-gradient(0deg, {bgColor} {low}%, {color} {low}%, {color} {high}%, {bgColor} {high}%)";
        //if (weekend)
        //    css = "linear-gradient(0deg, #CCCCCC 5%, #000000 5%, #000000 {low}%, {color} {low}%, {color} {high}%, #000000 {high}%)";
        css = replaceAll(css, "{bgColor}", bgColor);
        css = replaceAll(css, "{low}", getTempPercentage(low));
        css = replaceAll(css, "{high}", getTempPercentage(high));
        css = replaceAll(css, "{color}", color);
        return css;
    }

	function fillCurrently(currently) {
		var desc = $('#currently .desc');
		var temp = $('#currently .temp');

		skycons.set(iconCanvases[0], currently.icon);
		
		desc.html(currently.summary);
		
		currentTemp = Math.round(currently.temperature);
		if (temp.length) {
			temp.html(currentTemp+"°");
        }

        var cell = $("#currently");
        var color = "#661111";
        cell.css("background", getGradient(currently.temperature, parseInt(currently.temperature) + 1, color));
    }
    
    function lerp(val, minRange, maxRange, minOutput, maxOutput)
    {
        return minOutput + ((val - minRange) / (maxRange - minRange) * (maxOutput - minOutput));
    }
    
    function isWeekend(day)
    {
        return day > 5;//day.toLowerCase() == "sat" || day.toLowerCase() == "sun";// || day.toLowerCase() == "fri";
	}
	var weekday = new Array(7);
	weekday[0] =  "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";
	var shortWeekday = new Array(7);
	shortWeekday[0] =  "Sun";
	shortWeekday[1] = "Mon";
	shortWeekday[2] = "Tues";
	shortWeekday[3] = "Wed";
	shortWeekday[4] = "Thurs";
	shortWeekday[5] = "Fri";
	shortWeekday[6] = "Sat";

	function fillForecast(day, forecast) {
		// Choose one of the five forecast cells to fill
		var forecastCell = '#forecast' + day + ' ';
		var dayDiv = $(forecastCell + '.day');
		var desc = $(forecastCell + '.desc');
		var high = $(forecastCell + '.high');
		var low = $(forecastCell + '.low');
        
        var cell = $(forecastCell);
        var color = "rgb({color}, {color}, {color})";
        var colorVal = Math.round(lerp(forecast.temperatureHigh, tempRangeMin, tempRangeMax, 20, 100));// Math.round(getTempPercentage(forecast.temperatureHigh) * 0.55);
        color = replaceAll(color, "{color}", colorVal);
		var forecastTime = new Date(0);
		forecastTime.setUTCSeconds(forecast.time);
		var gradient = getGradient(forecast.temperatureLow, forecast.temperatureHigh, color, isWeekend(forecastTime.getDay()));
        cell.css("background", gradient);
        //cell.css("border-color", isWeekend(forecast.day) ? "white" : "#222222");
        //cell.css("border-width", isWeekend(forecast.day) ? "2px" : "1px");
        
        // If this is the first cell, call it "Today" instead of the day of the week
        if (dayDiv.length)
        {
            dayDiv.html(shortWeekday[forecastTime.getDay()]);
            if (isWeekend(forecastTime.getDay()))
                dayDiv.addClass("weekend");
            else
                dayDiv.removeClass("weekend");
        }

		// Insert the forecast details. Icons may be changed by editing the icons array.
		skycons.set(iconCanvases[day], forecast.icon);
		
		//desc.html(forecast.summary);
		
		if (high.length) {
			high.html(Math.round(forecast.temperatureHigh) + "°");
		}
		if (low.length) {
			low.html(Math.round(forecast.temperatureLow) + "°");
		}
	}

	function queryWeather() {
		var url = 'https://api.darksky.net/forecast/' + apiKey + '/' + latitude + ',' + longitude + '?exclude=hourly,minutely,flags';
		$.ajax({
			type: 'GET',
            url: 'https://cors-anywhere.herokuapp.com/' + url,
			dataType: 'json'
		}).done(function (result) {
			// Drill down into the returned data to find the relevant weather information
            var forecasts = result.daily.data;
            
            // update ranges

            updateTempRange(forecasts, result.currently);
			fillCurrently(result.currently);
			fillForecast(1, forecasts[0]);
			fillForecast(2, forecasts[1]);
			fillForecast(3, forecasts[2]);
			fillForecast(4, forecasts[3]);
			fillForecast(5, forecasts[4]);
			skycons.play();
		});

	}

	$(window).on('load', function(){
		// Fetch the weather data for right now
		queryWeather();

		// Query weather at the requested interval for new weather data
		setInterval(function() {
            queryWeather();
		}, waitBetweenWeatherQueriesMS);


		// Refresh the time and date every second
		setInterval(updateTime, 1000);
        updateTime();

		// Refresh the time and date every 30 seconds
		setInterval(updateCryptos, 30000);
        updateCryptos();

        // Refresh the countdowns every hour
        setInterval(updateCountdown, 60 * 60 * 1000);
        updateCountdown();

        $("#time").on({
            "change": function ()
            {
                var newPage = $(this).val();
                window.open(newPage, '_self', false);
            },
            'focus': function ()
            {
                isTimeMenuOpen = true;
            },
            "blur": function ()
            {
                isTimeMenuOpen = false;
            }
        });
	});
}

var isTimeMenuOpen = false;

var countdowns = [
    { date: "10/31/2017", name: "Halloween" },
    { date: "11/11/2017", name: "Vegas" },
    { date: "11/20/2017", name: "Tokyo" },
    { date: "12/11/2017", name: "GCB Returns" },
    { date: "12/25/2017", name: "Christmas" }
];

function updateTime()
{
    if (isTimeMenuOpen)
        return;
	// Set the current time and date on the clock
    $('.placeholder').html(new Date().toLocaleTimeString());
    //$('#date').val(new Date().toLocaleDateString());
}

function updateCountdown()
{
    $('#countdown').html(getCountdown());
}

function getCountdown()
{
    var html = "";
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date();
    for (var i = 0; i < countdowns.length; i++)
    {
        var countdown = countdowns[i];
        var secondDate = new Date(countdown.date);
        var days = Math.round((secondDate.getTime() - firstDate.getTime()) / oneDay);
        var prefix;
        if (days < 0)
            continue;
        if (days == 0)
            prefix = "Today is ";
        else if (days == 1)
            prefix = "Tomorrow is ";
        else if (days == 2)
            prefix = days + " day until ";
        else
            prefix = days + " days until ";
        html += prefix + countdown.name + "!<br>";
    }
    return html;
}


var cryptos = [
    {
        "name": "Bitcoin",
        "symbol": "BTC",
        "holding": 0.46973
    },
    {
        "name": "Ether",
        "symbol": "ETH",
        "holding": 14
    },
    {
        "name": "Litecoin",
        "symbol": "LTC",
        "holding": 43.16
    }
];

var updatingCryptos = false;
function updateCryptos()
{
    if (updatingCryptos)
    {
        $('.tickerStatus').html("Already updating...");
        console.log("already updating cryptos");
        //return;
    }
    console.log("updating cryptos");
    updatingCryptos = true;
    $('.tickerStatus').html("Updating...");
    var url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms={symbols}&tsyms=USD";
    var symbolStr = "";
    for (var i = 0; i < cryptos.length; i++)
        symbolStr += cryptos[i].symbol + ",";
    url = url.split("{symbols}").join(symbolStr);
    $.getJSON(url, function (data)
    {
        var html = "";
        for (var i = 0; i < cryptos.length; i++)
        {
            var crypto = cryptos[i];
            if (data[crypto.symbol])
            {
                var usdValue = data[crypto.symbol].USD;
                if (i > 0) html += " - ";
                html += crypto.name + " @ $" + usdValue.toFixed(2);// + " ($" + (usdValue * crypto.holding).toFixed(2) + ")";
            } 
        }
        $('.ticker').html(html);
        
        updatingCryptos = false;
        $('.tickerStatus').html("");
    });
}