import fetch from "node-fetch";
import { TwitterApi } from "twitter-api-v2";
import { keys } from "./config.js";

const { consumerKey, consumerSecret, accessToken, accessTokenSecret, weatherApiKey } = keys;

const twitterClient = new TwitterApi({
  appKey: consumerKey,
  appSecret: consumerSecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});

async function getWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`❌ Weather API call failed: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching weather:", error);
    return null;
  }
}

async function postWeatherUpdate() {
  try {
    const weatherData = await getWeatherData("Bengaluru");

    if (!weatherData || !weatherData.main || !weatherData.weather?.length) {
      console.log("⚔️ Weather data is incomplete.");
      return;
    }

    const temp = weatherData.main.temp.toFixed(1);
    const desc = weatherData.weather[0].description;
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tweetContent = `🌦 Bengaluru Weather: ${temp}°C, ${desc}. 🕒 ${time} #XWeatherBot`;

    console.log("📝 Posting tweet:", tweetContent);

    const tweet = await twitterClient.v2.tweet(tweetContent);

    if (tweet) {
      console.log("✅ Tweet sent:", tweet.data.text);
    } else {
      console.log("❌ Tweet failed to send.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

console.log("🟢 XWeather bot is running... Press Ctrl+C to exit.");
postWeatherUpdate(); 
setInterval(postWeatherUpdate, 60 * 60 * 1000);
