import { WeatherData } from "@/types/weather";

export async function getWeatherData(city: string): Promise<WeatherData> {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=metric&appid=${API_KEY}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) {
      throw new Error(`API 錯誤: ${res.status}`);
    }

    return await res.json();

  } catch (error) {
   
    throw error;
  }
}