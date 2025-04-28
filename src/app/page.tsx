"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
    Cloud,
    CloudSnow,
    CloudRain,
    CloudFog,
    Sun,
    Moon,
    Thermometer,
    Wind,
    Droplet,
    MapPin,
    Search,
    AlertTriangle,
    Loader2,
    CloudSun,
    CloudMoon,
    CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
    };
    weather: {
        main: string;
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
    };
    sys: {
        country: string;
        sunrise: number;
        sunset: number;
    };
    dt: number;
    timezone: number;
    cod: number;
    message?: string;
}

const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const fetchWeatherData = async (cityName: string) => {
        if (!cityName.trim()) return;

        setLoading(true);
        setError(null);
        setWeatherData(null);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError('City not found. Please enter a valid city name.');
                } else {
                    setError('An error occurred while fetching weather data.');
                }
                return;
            }

            const data: WeatherData = await response.json();
            if (data.cod === 404) {
                setError('City not found');
                return;
            }
            setWeatherData(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchWeatherData(city);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const getDayOrNight = (dt: number, timezone: number, sunrise: number, sunset: number) => {
        const localTime = dt + timezone;
        const sunriseLocal = sunrise + timezone;
        const sunsetLocal = sunset + timezone;
        return localTime >= sunriseLocal && localTime <= sunsetLocal;
    };

    const formatTemperature = (temp: number) => {
        return `${Math.round(temp)}°C`;
    };

    const getFormattedTime = (timestamp: number, timezone: number) => {
        const localTimestamp = (timestamp + timezone) * 1000;
        const date = new Date(localTimestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        });
    };

    const getFormattedDate = (timestamp: number, timezone: number) => {
        const localTimestamp = (timestamp + timezone) * 1000;
        const date = new Date(localTimestamp);
        return date.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    const getBackgroundClass = (weatherCode?: string, isDay?: boolean) => {
        if (!weatherCode) return 'from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900';

        const code = weatherCode.slice(0, 2);

        if (code === '01') {
            return isDay
                ? 'from-sky-400 to-blue-500 dark:from-blue-900 dark:to-indigo-900'
                : 'from-indigo-900 to-gray-900 dark:from-gray-900 dark:to-black';
        } else if (code === '02' || code === '03') {
            return isDay
                ? 'from-blue-300 to-blue-400 dark:from-blue-800 dark:to-blue-900'
                : 'from-blue-800 to-indigo-900 dark:from-gray-800 dark:to-gray-900';
        } else if (code === '04') {
            return 'from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800';
        } else if (code === '09' || code === '10') {
            return 'from-gray-400 to-blue-500 dark:from-gray-700 dark:to-blue-900';
        } else if (code === '11') {
            return 'from-gray-600 to-blue-700 dark:from-gray-800 dark:to-blue-900';
        } else if (code === '13') {
            return 'from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900';
        } else if (code === '50') {
            return 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700';
        }
        return 'from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900';
    };

    const getWeatherIcon = (iconCode: string, isDay: boolean) => {
        if (!iconCode) return <Cloud className="w-8 h-8 text-gray-500" />;

        const iconClass = "w-8 h-8";
        switch (iconCode.slice(0, 2)) {
            case '01':
                return isDay
                    ? <Sun className={`${iconClass} text-yellow-400`} />
                    : <Moon className={`${iconClass} text-gray-300`} />;
            case '02':
            case '03':
                return isDay
                    ? <CloudSun className={`${iconClass} text-yellow-400`} />
                    : <CloudMoon className={`${iconClass} text-gray-300`} />;
            case '04':
                return <Cloud className={`${iconClass} text-gray-400`} />;
            case '09':
            case '10':
                return <CloudRain className={`${iconClass} text-blue-400`} />;
            case '11':
                return <CloudLightning className={`${iconClass} text-yellow-300`} />;
            case '13':
                return <CloudSnow className={`${iconClass} text-blue-200`} />;
            case '50':
                return <CloudFog className={`${iconClass} text-gray-300`} />;
            default:
                return <Cloud className={`${iconClass} text-gray-400`} />;
        }
    };

    const isDayTime = weatherData ? getDayOrNight(
        weatherData.dt,
        weatherData.timezone,
        weatherData.sys.sunrise,
        weatherData.sys.sunset
    ) : true;

    const backgroundClass = weatherData
        ? getBackgroundClass(weatherData.weather[0].icon, isDayTime)
        : getBackgroundClass();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <h2 className="text-2xl font-bold text-red-500">Error</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setCity('');
                            inputRef.current?.focus();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-cover bg-center transition-all duration-1000 ease-in-out`}
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}
        >
            <div className={`absolute inset-0 ${backgroundClass} opacity-80 transition-all duration-1000 ease-in-out`} />
            <div className="relative z-10">
                <div className="container mx-auto px-4 py-16">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <motion.div
                                className="flex-1"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Enter city name"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all duration-300 hover:shadow-xl"
                                    ref={inputRef}
                                />
                            </motion.div>
                            <motion.button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl"
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" />
                                        Search
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {weatherData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <MapPin className="w-6 h-6 text-blue-500" />
                                                    {weatherData.name}, {weatherData.sys.country}
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {getFormattedDate(weatherData.dt, weatherData.timezone)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                    {getFormattedTime(weatherData.dt, weatherData.timezone)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 5, -5, 0]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        repeatType: "reverse"
                                                    }}
                                                >
                                                    {getWeatherIcon(weatherData.weather[0].icon, isDayTime)}
                                                </motion.div>
                                                <div>
                                                    <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                                        {formatTemperature(weatherData.main.temp)}
                                                    </div>
                                                    <div className="text-lg capitalize text-gray-600 dark:text-gray-300">
                                                        {weatherData.weather[0].description}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                    Feels like {formatTemperature(weatherData.main.feels_like)}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    H: {formatTemperature(weatherData.main.temp_max)} • L: {formatTemperature(weatherData.main.temp_min)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[
                                                { icon: <Thermometer className="w-5 h-5" />, label: 'Humidity', value: `${weatherData.main.humidity}%` },
                                                { icon: <Wind className="w-5 h-5" />, label: 'Wind', value: `${weatherData.wind.speed} m/s` },
                                                { icon: <Droplet className="w-5 h-5" />, label: 'Pressure', value: `${weatherData.main.pressure} hPa` },
                                                { icon: <Sun className="w-5 h-5" />, label: 'Sunrise', value: getFormattedTime(weatherData.sys.sunrise, weatherData.timezone) },
                                                { icon: <Moon className="w-5 h-5" />, label: 'Sunset', value: getFormattedTime(weatherData.sys.sunset, weatherData.timezone) },
                                            ].map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                                                    whileHover={{ y: -2 }}
                                                >
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        {item.icon}
                                                        <span className="text-sm">{item.label}</span>
                                                    </div>
                                                    <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                                        {item.value}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WeatherApp;
