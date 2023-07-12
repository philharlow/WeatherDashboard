if (process.env.OPEN_WEATHER_API_KEY) {
    window.OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
}
console.log("OPEN_WEATHER_API_KEY is", process.env.OPEN_WEATHER_API_KEY);