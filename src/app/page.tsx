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

// Replace with your actual API key
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
    message?: string; // For error messages
}

// Helper function to select weather icon
const getWeatherIcon = (iconCode: string, isDay: boolean) => {
    if (!iconCode) return <Cloud className="w-6 h-6" />;

    const prefix = isDay ? 'day' : 'night';
    switch (iconCode.slice(0, 2)) {
        case '01': // Clear
            return isDay ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />;
        case '02': // Few clouds
        case '03': // Scattered clouds
            return isDay ? <CloudSun className="w-6 h-6" /> : <CloudMoon className="w-6 h-6" />;
        case '04': // Broken clouds
            return <Cloud className="w-6 h-6" />;
        case '09': // Shower rain
            return <CloudRain className="w-6 h-6" />;
        case '10': // Rain
            return <CloudRain className="w-6 h-6" />;
        case '11': // Thunderstorm
            return <CloudLightning className="w-6 h-6" />;
        case '13': // Snow
            return <CloudSnow className="w-6 h-6" />;
        case '50': // Mist
            return <CloudFog className="w-6 h-6" />;
        default:
            return <Cloud className="w-6 h-6" />;
    }
};

const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const fetchWeatherData = async (cityName: string) => {
        if (!cityName.trim()) return;

        setLoading(true);
        setError(null);
        setWeatherData(null); // Clear previous data

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
                return; // Stop processing on error
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

    // Handle Enter key press in input
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

    // Format temperature with degree symbol
    const formatTemperature = (temp: number) => {
        return `${Math.round(temp)}°C`;
    };

    // Date and Time formatting (Local)
    const getFormattedTime = (timestamp: number, timezone: number) => {
        const localTimestamp = (timestamp + timezone) * 1000; // Convert to ms
        const date = new Date(localTimestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC', // Important: Use UTC as we've adjusted the timestamp
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
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Error
                        </h2>
                    </div>
                    <div className="p-4">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setCity('');
                                inputRef.current?.focus();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded-md"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-start justify-center pt-16">
            <div className="w-full max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter city name"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ref={inputRef}
                        data-testid="city-input"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                        disabled={loading}
                        data-testid="search-button"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</>
                        ) : (
                            <><Search className="mr-2 h-4 w-4" />Search</>
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {weatherData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                                data-testid="weather-card"
                            >
                                <div className="p-4">
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        {weatherData.name}, {weatherData.sys.country}
                                    </h2>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {getFormattedDate(weatherData.dt, weatherData.timezone)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            {getWeatherIcon(
                                                weatherData.weather[0].icon,
                                                getDayOrNight(
                                                    weatherData.dt,
                                                    weatherData.timezone,
                                                    weatherData.sys.sunrise,
                                                    weatherData.sys.sunset
                                                )
                                            )}
                                            <div>
                                                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                                    {formatTemperature(weatherData.main.temp)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {weatherData.weather[0].description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                Feels like {formatTemperature(weatherData.main.feels_like)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                H: {formatTemperature(weatherData.main.temp_max)}  L: {formatTemperature(weatherData.main.temp_min)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Thermometer className="w-4 h-4" />
                                                Humidity:
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {weatherData.main.humidity}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Wind className="w-4 h-4" />
                                                Wind:
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {weatherData.wind.speed} m/s
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Droplet className="w-4 h-4" />
                                                Pressure:
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {weatherData.main.pressure} hPa
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Sun className="w-4 h-4" />
                                                Sunrise:
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {getFormattedTime(weatherData.sys.sunrise, weatherData.timezone)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Moon className="w-4 h-4" />
                                                Sunset:
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {getFormattedTime(weatherData.sys.sunset, weatherData.timezone)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WeatherApp;
