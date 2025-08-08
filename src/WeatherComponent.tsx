import React, { useState, useEffect } from 'react';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
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
  name: string;
  sys: {
    country: string;
  };
}

interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
    dt_txt: string;
  }[];
  city: {
    name: string;
    country: string;
  };
}

const WeatherComponent: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Vous devrez obtenir une clé API gratuite sur https://openweathermap.org/api
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getCurrentWeather = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`
      );
      if (!response.ok) {
        throw new Error('Ville non trouvée');
      }
      const data = await response.json();
      setCurrentWeather(data);
    } catch (err) {
      throw new Error('Erreur lors de la récupération des données météo actuelles');
    }
  };

  const getForecast = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`
      );
      if (!response.ok) {
        throw new Error('Ville non trouvée');
      }
      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      throw new Error('Erreur lors de la récupération des prévisions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Veuillez entrer une ville');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        getCurrentWeather(city),
        getForecast(city)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherForDate = () => {
    if (!forecastData || !selectedDate) return null;
    
    const targetDate = new Date(selectedDate);
    targetDate.setHours(12, 0, 0, 0); // Midi pour la prévision
    
    const forecast = forecastData.list.find(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === targetDate.toDateString();
    });
    
    return forecast;
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Générer les 5 prochains jours pour le sélecteur de date
  const getNext5Days = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const selectedDateWeather = getWeatherForDate();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 min-h-screen">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          🌤️ Prévisions Météorologiques
        </h1>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Paris, Londres, Tokyo..."
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date (optionnel)
              </label>
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une date</option>
                {getNext5Days().map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </div>
        </form>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            {error.includes('YOUR_API_KEY_HERE') && (
              <div className="mt-2 text-sm">
                <strong>Note:</strong> Pour utiliser ce composant, vous devez:
                <ol className="list-decimal list-inside mt-1">
                  <li>Créer un compte gratuit sur <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenWeatherMap</a></li>
                  <li>Obtenir votre clé API gratuite</li>
                  <li>Remplacer 'YOUR_API_KEY_HERE' dans le code par votre clé API</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Météo actuelle */}
        {currentWeather && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Météo actuelle - {currentWeather.name}, {currentWeather.sys.country}
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={getWeatherIcon(currentWeather.weather[0].icon)}
                  alt={currentWeather.weather[0].description}
                  className="w-16 h-16"
                />
                <div className="ml-4">
                  <div className="text-4xl font-bold text-gray-800">
                    {Math.round(currentWeather.main.temp)}°C
                  </div>
                  <div className="text-lg text-gray-600 capitalize">
                    {currentWeather.weather[0].description}
                  </div>
                </div>
              </div>
              <div className="text-right text-gray-600">
                <div>Ressenti: {Math.round(currentWeather.main.feels_like)}°C</div>
                <div>Humidité: {currentWeather.main.humidity}%</div>
                <div>Vent: {Math.round(currentWeather.wind.speed * 3.6)} km/h</div>
                <div>Pression: {currentWeather.main.pressure} hPa</div>
              </div>
            </div>
          </div>
        )}

        {/* Prévision pour la date sélectionnée */}
        {selectedDate && selectedDateWeather && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Prévision pour le {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center">
              <img
                src={getWeatherIcon(selectedDateWeather.weather[0].icon)}
                alt={selectedDateWeather.weather[0].description}
                className="w-16 h-16"
              />
              <div className="ml-4">
                <div className="text-3xl font-bold text-gray-800">
                  {Math.round(selectedDateWeather.main.temp)}°C
                </div>
                <div className="text-lg text-gray-600 capitalize">
                  {selectedDateWeather.weather[0].description}
                </div>
                <div className="text-sm text-gray-500">
                  Humidité: {selectedDateWeather.main.humidity}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prévisions sur 5 jours */}
        {forecastData && (
          <div className="p-6 bg-gray-50 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Prévisions sur 5 jours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {getNext5Days().map(date => {
                const forecast = forecastData.list.find(item => {
                  const itemDate = new Date(item.dt * 1000);
                  const targetDate = new Date(date);
                  return itemDate.toDateString() === targetDate.toDateString();
                });

                if (!forecast) return null;

                return (
                  <div
                    key={date}
                    className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {new Date(date).toLocaleDateString('fr-FR', { 
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <img
                      src={getWeatherIcon(forecast.weather[0].icon)}
                      alt={forecast.weather[0].description}
                      className="w-12 h-12 mx-auto mb-2"
                    />
                    <div className="text-lg font-bold text-gray-800">
                      {Math.round(forecast.main.temp)}°C
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {forecast.weather[0].description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions d'utilisation */}
        {!currentWeather && !loading && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">🌍 Entrez une ville pour voir la météo</p>
            <p className="text-sm">
              Vous pouvez également sélectionner une date pour voir les prévisions spécifiques
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherComponent; 