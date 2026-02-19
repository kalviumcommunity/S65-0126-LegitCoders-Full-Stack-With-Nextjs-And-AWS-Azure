import axios from 'axios';
import config from '@config/env';
import { cacheManager } from '@utils/cache';
import logger from '@utils/logger';
import { ExternalApiError } from '@utils/errors';
import { prisma } from '@config/database';

export interface WeatherData {
  rainfall: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  recordedAt: Date;
}

export interface OpenWeatherResponse {
  rain?: { '1h': number };
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

export class WeatherService {
  private apiKey = config.openweathermap_api_key;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private cacheTtl = config.weather_api_cache_ttl;

  /**
   * Fetch weather data for a district
   */
  async fetchWeatherForDistrict(
    latitude: number,
    longitude: number,
    districtId: string
  ): Promise<WeatherData> {
    const cacheKey = `weather:${districtId}`;

    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        try {
          const response = await axios.get<OpenWeatherResponse>(
            this.baseUrl,
            {
              params: {
                lat: latitude,
                lon: longitude,
                appid: this.apiKey,
                units: 'metric',
              },
              timeout: 10000,
            }
          );

          logger.debug(`Fetched weather for district ${districtId}`);

          return {
            rainfall: response.data.rain?.['1h'] || 0,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed * 3.6, // Convert m/s to km/h
            recordedAt: new Date(),
          };
        } catch (error: any) {
          logger.error(
            `Weather API error for district ${districtId}:`,
            error.message
          );
          throw new ExternalApiError(
            `Failed to fetch weather data: ${error.message}`
          );
        }
      },
      this.cacheTtl
    );
  }

  /**
   * Store weather data in database
   */
  async storeWeatherData(
    districtId: string,
    weatherData: WeatherData
  ): Promise<any> {
    try {
      const stored = await prisma.weatherData.create({
        data: {
          districtId,
          rainfall: weatherData.rainfall,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          recordedAt: weatherData.recordedAt,
        },
      });

      logger.debug(`Stored weather data for district ${districtId}`);
      return stored;
    } catch (error) {
      logger.error(`Error storing weather data for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Get latest weather data from database
   */
  async getLatestWeather(districtId: string): Promise<any | null> {
    try {
      const latest = await prisma.weatherData.findFirst({
        where: { districtId },
        orderBy: { recordedAt: 'desc' },
      });

      return latest;
    } catch (error) {
      logger.error(`Error fetching latest weather for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Get weather data within time range
   */
  async getWeatherDataRange(
    districtId: string,
    startTime: Date,
    endTime: Date
  ): Promise<any[]> {
    try {
      const data = await prisma.weatherData.findMany({
        where: {
          districtId,
          recordedAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: { recordedAt: 'asc' },
      });

      return data;
    } catch (error) {
      logger.error(`Error fetching weather range for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate rainfall accumulation
   */
  async getRainfallAccumulation(
    districtId: string,
    hours: number = 24
  ): Promise<number> {
    try {
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const data = await this.getWeatherDataRange(
        districtId,
        startTime,
        new Date()
      );

      const total = data.reduce((sum, record) => sum + record.rainfall, 0);
      return total;
    } catch (error) {
      logger.error(
        `Error calculating rainfall accumulation for district ${districtId}:`,
        error
      );
      return 0;
    }
  }
}

export const weatherService = new WeatherService();
export default weatherService;
