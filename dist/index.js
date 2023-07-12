(function() {
	'use strict';
	/*global $, moment*/

    const apiKey = window.API_KEY ?? "uhoh";
    console.log("API_KEY: ", apiKey);
    
	/*************************************************************************/
	/*****************************************************/
	/*********************************/
	// USER EDITABLE LINES - Change these to match your location and preferences!
    
	// Your temperature unit measurement
	// This bit is simple, 'c' for Celcius, and 'f' for Fahrenheit
	var unit = 'f';
	
	// Format for date and time
	var formatTime = 'h:mm:ss a'
	var formatDate = 'dddd, MMMM Do'

    var skycons = new Skycons({ "color": "white" });

	var waitBetweenWeatherQueriesMS = 20 * 60 * 1000; // 20min

	// You're done!
	/*********************************/
	/*****************************************************/
    /*************************************************************************/
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
        currentTemp = currently.temp
        tempRangeMax = Math.max(80, currentTemp);
        tempRangeMin = Math.min(40, currentTemp);
        for (var i = 0; i < 5; i++)
        {
            tempRangeMax = Math.max(tempRangeMax, results[i].temp.max);
            tempRangeMin = Math.min(tempRangeMin, results[i].temp.min);
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

    function getSkyconForWeatherApiIcon(icon) {
        //const icons = ['CLEAR_DAY', 'CLEAR_NIGHT', 'PARTLY_CLOUDY_DAY', 'PARTLY_CLOUDY_NIGHT', 'CLOUDY', 'RAIN', 'SLEET', 'SNOW', 'WIND', 'FOG'];
        switch (icon) {
            case "01d": return "CLEAR_DAY";
            case "01n": return "CLEAR_NIGHT";
            case "02d": return "PARTLY_CLOUDY_DAY";
            case "02n": return "PARTLY_CLOUDY_NIGHT";
            case "03d":
            case "03n":
            case "04d":
            case "04n":
                return "CLOUDY";
            case "09d":
            case "09n":
            case "10d":
            case "10n":
                return "RAIN";
            case "11d":
            case "11n":
                return "SLEET";
            case "13d":
            case "13n":
                return "SNOW";
            case "50d":
            case "50n":
                return "FOG";
        }
        return "CLEAR_DAY";
    }


	function fillCurrently(currently, forecast) {
		var desc = $('#currently .desc');
		var temp = $('#currently .temp');

		skycons.set(iconCanvases[0], getSkyconForWeatherApiIcon(currently.weather[0].icon));
		
		desc.html(currently.summary);
		
		currentTemp = Math.round(currently.temp);
		if (temp.length) {
			temp.html(currentTemp+"°");
        }


        var cell = $("#currently");
        var color = "rgb({color}, {color}, {color})";
        var colorVal = Math.round(lerp(currently.temp, tempRangeMin, tempRangeMax, 20, 100));// Math.round(getTempPercentage(forecast.temp.max) * 0.55);
        color = replaceAll(color, "{color}", colorVal);
        var gradient = getGradient(forecast.temp.min, currently.temp, color);
        cell.css("background", gradient);
    }
    
    function lerp(val, minRange, maxRange, minOutput, maxOutput)
    {
        return minOutput + ((val - minRange) / (maxRange - minRange) * (maxOutput - minOutput));
    }
    
    function isWeekend(day)
    {
        return day == 0 || day == 6;//day.toLowerCase() == "sat" || day.toLowerCase() == "sun";// || day.toLowerCase() == "fri";
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

    let easterDate = { month: 0, day: 0, icon: "🐇" }; // easter
    let thanksgivingDate = { month: 11, day: 0, icon: "🦃" }; // thxgiving

    let dayIcons = [
        { month: 7, day: 14, icon: "🎂" }, // Bellina's bday
        { month: 6, day: 28, icon: "🎉" }, // Phil's bday
        { month: 12, day: 25, icon: "🎄" }, // xmas
        { month: 10, day: 31, icon: "🎃" }, // halloween
        easterDate,
        thanksgivingDate,
        { month: 3, day: 17, icon: "☘️" }, // st paddys
        { month: 12, day: 31, icon: "🥳" }, // NYE
        { month: 1, day: 1, icon: "🎉" }, // NYD
        { month: 2, day: 14, icon: "❤️" }, // Valentines
        { month: 2, day: 2, icon: "🦔" }, // Groundhog
        { month: 7, day: 4, icon: "🇺🇸" }, // Independence
        { month: 11, day: 11, icon: "🎖️" }, // Veterans
        { month: 2, day: 1, year: 2022, icon: "🐉" }, // Chinese New Year
        { month: 1, day: 22, year: 2023, icon: "🐉" }, // Chinese New Year
        { month: 2, day: 10, year: 2024, icon: "🐉" }, // Chinese New Year
        { month: 1, day: 29, year: 2025, icon: "🐉" }, // Chinese New Year
        { month: 2, day: 17, year: 2026, icon: "🐉" }, // Chinese New Year
        { month: 2, day: 6, year: 2027, icon: "🐉" }, // Chinese New Year
        { month: 1, day: 26, year: 2028, icon: "🐉" }, // Chinese New Year
    ];
    
    // fathers day
    // mothers day
    // labor day
    // cino de mayo
    // mardi gras
    // mlk day

	function fillForecast(day, forecast) {
		// Choose one of the five forecast cells to fill
		var forecastCell = '#forecast' + day + ' ';
		var dayDiv = $(forecastCell + '.day');
		var desc = $(forecastCell + '.desc');
		var high = $(forecastCell + '.high');
		var low = $(forecastCell + '.low');
        
        var cell = $(forecastCell);
        var color = "rgb({color}, {color}, {color})";
        var colorVal = Math.round(lerp(forecast.temp.max, tempRangeMin, tempRangeMax, 20, 100));// Math.round(getTempPercentage(forecast.temp.max) * 0.55);
        color = replaceAll(color, "{color}", colorVal);
		var forecastTime = new Date(0);
        // console.log("forecast: ", forecast)
		forecastTime.setUTCSeconds(forecast.dt);
		var gradient = getGradient(forecast.temp.min, forecast.temp.max, color, isWeekend(forecastTime.getDay()));
        cell.css("background", gradient);
        //cell.css("border-color", isWeekend(forecast.day) ? "white" : "#222222");
        //cell.css("border-width", isWeekend(forecast.day) ? "2px" : "1px");
        
        // If this is the first cell, call it "Today" instead of the day of the week
        if (dayDiv.length)
        {
            let inner = shortWeekday[forecastTime.getDay()];
            dayIcons.forEach(icon => {
                if (icon.day == forecastTime.getDate() && icon.month == forecastTime.getMonth() + 1 && (!icon.year || icon.year == (forecastTime.getYear() + 1900)))
                    inner = icon.icon + " " + inner;
            });
            dayDiv.html(inner);
            if (isWeekend(forecastTime.getDay()))
                dayDiv.addClass("weekend");
            else
                dayDiv.removeClass("weekend");
        }

		// Insert the forecast details. Icons may be changed by editing the icons array.
		skycons.set(iconCanvases[day], getSkyconForWeatherApiIcon(forecast.weather[0].icon));
		
		//desc.html(forecast.summary);
		
		if (high.length) {
			high.html(Math.round(forecast.temp.max) + "°");
		}
		if (low.length) {
			low.html(Math.round(forecast.temp.min) + "°");
		}
    }

    
    let lastYear = 0;
    function queryWeather()
    {
        let now = new Date();
        if (now.getFullYear() != lastYear)
        {
            // Calc easter
            lastYear = now.getFullYear();
            let Y = lastYear;
            var C = Math.floor(Y / 100);
            var N = Y - 19 * Math.floor(Y / 19);
            var K = Math.floor((C - 17) / 25);
            var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
            I = I - 30 * Math.floor((I / 30));
            I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
            var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
            J = J - 7 * Math.floor(J / 7);
            var L = I - J;
            var M = 3 + Math.floor((L + 40) / 44);
            var D = L + 28 - 31 * Math.floor(M / 4);
            easterDate.month = M;
            easterDate.day = D;
            console.log("Found easter to be on: " + easterDate.month + "/" + easterDate.day);
            
            let lastOfNov = new Date(lastYear, 10, 30).getDay();
            thanksgivingDate.day = (lastOfNov >= 4 ? 34 : 27) - lastOfNov;
            console.log("Found thxgiving to be on: " + thanksgivingDate.month + "/" + thanksgivingDate.day);

        }
		const latitude = "47.818863";
		const longitude = "-122.185093";

		var url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=imperial&exclude=minutely,hourly,alert&appid=${apiKey}`;
		$.ajax({
			type: 'GET',
            url: url,
			dataType: 'json'
		}).done(function (result) {
			// Drill down into the returned data to find the relevant weather information
      //console.log("got response", result);
            var forecasts = result.daily;

                    // update ranges

            updateTempRange(forecasts, result.current);
			fillCurrently(result.current, forecasts[0]);
			fillForecast(1, forecasts[0]);
			fillForecast(2, forecasts[1]);
			fillForecast(3, forecasts[2]);
			fillForecast(4, forecasts[3]);
			fillForecast(5, forecasts[4]);
			//fillLinks(result.link);
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
}());

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

    let now = new Date();
	// Set the current time and date on the clock
    $('.placeholder').html(now.toLocaleTimeString());
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