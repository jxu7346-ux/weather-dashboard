"use client";

import { getWeatherData } from "@/lib/weather";
import { Search, Wind, Droplets, Thermometer, MapPin, Loader2 } from "lucide-react";
import { WeatherData } from "@/types/weather";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap"; 

const weatherEffects = {
  Clear: {
    bg: "from-blue-400 to-yellow-200",
    iconColor: "text-yellow-400",
    label: "晴天"
  },
  Clouds: {
    bg: "from-gray-400 to-blue-300",
    iconColor: "text-gray-100",
    label: "多雲"
  },
  Rain: {
    bg: "from-slate-700 to-blue-900",
    iconColor: "text-blue-300",
    label: "雨天"
  },
  Snow: {
    bg: "from-blue-100 to-slate-300",
    iconColor: "text-white",
    label: "下雪"
  },
  Thunderstorm: {
    bg: "from-gray-900 to-purple-900",
    iconColor: "text-yellow-500",
    label: "雷雨"
  },
  Default: {
    bg: "from-blue-500 to-blue-300",
    iconColor: "text-white",
    label: "未知"
  }
};

export default function WeatherPage() {
  const [city, setCity] = useState(""); 
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentWeather = weather?.weather[0].main as keyof typeof weatherEffects;
  const theme = weatherEffects[currentWeather] || weatherEffects.Default;

  // 2. 設定動畫用的 Ref
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (weather && !loading) {
      const tl = gsap.timeline();
      
      // 卡片浮現
      tl.fromTo(cardRef.current, 
        { opacity: 0, y: 30, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );

      // 內容由下往上冒出
      tl.fromTo(".info-item", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.4" // 提早 0.4 秒開始
      );

      // 圖示浮動動畫 (循環)
      gsap.to(iconRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, [weather, loading]);

  // 初始化載入
  useEffect(() => {
    fetchWeather("Taipei");
  }, []);

  // 封裝 API 抓取邏輯
  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    
    try {
      setLoading(true);
      setError("");
      const data = await getWeatherData(cityName);
      console.log(data)
      setWeather(data);
    } catch (err: any) {
      console.error("抓取天氣失敗:", err);
      setError("找不到該城市，請重新輸入");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // 處理表單送出
  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWeather(city);
  };

  return (
    <main className={`min-h-screen flex items-center justify-center p-6 transition-all duration-1000 bg-gradient-to-br ${theme.bg}`}>
      
      {/* 天氣卡片容器 */}
      <div ref={cardRef} className="weather-card w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 text-white">
        
        {/* 搜尋列 */}
        <div className="relative mb-8">
          <form onSubmit={handleForm}>
            <input
              type="text"
              value={city}
              placeholder="搜尋城市 (例如: Tokyo, London)..."
              className="w-full bg-white/10 border border-white/30 rounded-2xl py-3 px-5 pr-12 outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/60 transition-all"
              onChange={(e) => setCity(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin text-white/70" size={20} />
              ) : (
                <Search className="text-white/70" size={20} />
              )}
            </button>
          </form>
        </div>

        {/* 狀態切換渲染 */}
        {loading && !weather ? (
          <div ref={contentRef} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="animate-pulse">正在觀測氣象...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="bg-red-500/20 py-2 px-4 rounded-lg inline-block">{error}</p>
          </div>
        ) : weather ? (
          <>
            {/* 主要天氣資訊 */}
            <div className="text-center mb-10">
              <div className="flex justify-center items-center gap-2 mb-2">
                <MapPin size={20} className="text-blue-200" />
                <h1 className="text-3xl font-bold tracking-wide">{weather.name}</h1>
              </div>
              <p className="text-white/80 font-light">
                {new Date().toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              {/* 天氣圖示 */}
              <div className="my-8 flex justify-center relative">
                 <div className="w-32 h-32 bg-yellow-300 rounded-full blur-2xl absolute opacity-30 animate-pulse"></div>
                 <img ref={iconRef}
                   src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                   alt={weather.weather[0].description}
                   className="relative z-10 w-32 h-32 drop-shadow-lg" 
                 />
              </div>

              <div className="info-item flex justify-center items-start">
                <span className="text-8xl font-bold tracking-tighter">
                  {Math.round(weather.main.temp)}
                </span>
                <span className="text-3xl mt-4">°C</span>
              </div>
              <p className="text-xl mt-2 font-medium capitalize">{weather.weather[0].description}</p>
            </div>

            {/* 次要詳細資訊網格 */}
            <div className="info-item grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
              <div className="flex flex-col items-center">
                <Thermometer size={20} className="mb-2 text-orange-200" />
                <span className="text-xs uppercase opacity-60">體感</span>
                <span className="font-semibold">{Math.round(weather.main.feels_like)}°</span>
              </div>
              <div className="flex flex-col items-center">
                <Droplets size={20} className="mb-2 text-blue-200" />
                <span className="text-xs uppercase opacity-60">濕度</span>
                <span className="font-semibold">{weather.main.humidity}%</span>
              </div>
              <div className="flex flex-col items-center">
                <Wind size={20} className="mb-2 text-teal-200" />
                <span className="text-xs uppercase opacity-60">風速</span>
                <span className="font-semibold">{weather.wind.speed.toFixed(1)} <small>m/s</small></span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-white/60">
            請輸入城市開始查詢
          </div>
        )}
      </div>
    </main>
  );
}