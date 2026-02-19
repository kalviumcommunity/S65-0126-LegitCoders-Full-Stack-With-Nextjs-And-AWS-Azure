import { NextApiRequest, NextApiResponse } from 'next';
import { weatherService } from '@services/weather';
import { districtService } from '@services/district';
import { sendSuccess, sendError } from '@utils/response';
import { ValidationError } from '@utils/errors';
import logger from '@utils/logger';

export async function fetchAndStoreWeather(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    // Get district info
    const district = await districtService.getDistrictById(districtId);

    // Fetch weather data from API
    const weatherData = await weatherService.fetchWeatherForDistrict(
      district.latitude,
      district.longitude,
      districtId
    );

    // Store in database
    const stored = await weatherService.storeWeatherData(districtId, weatherData);

    return sendSuccess(res, stored, 'Weather data fetched and stored successfully', 201);
  } catch (error: any) {
    logger.error('Fetch weather error:', error);
    throw error;
  }
}

export async function getLatestWeather(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    const weather = await weatherService.getLatestWeather(districtId);

    if (!weather) {
      return sendSuccess(res, null, 'No weather data available', 200);
    }

    return sendSuccess(res, weather, 'Latest weather data retrieved successfully');
  } catch (error: any) {
    logger.error('Get latest weather error:', error);
    throw error;
  }
}

export async function getWeatherRange(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId, hours } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    const hoursValue = parseInt((hours as string) || '24', 10);

    if (hoursValue < 1 || hoursValue > 720) {
      throw new ValidationError('Hours must be between 1 and 720 (30 days)');
    }

    const startTime = new Date(Date.now() - hoursValue * 60 * 60 * 1000);
    const endTime = new Date();

    const weatherData = await weatherService.getWeatherDataRange(
      districtId,
      startTime,
      endTime
    );

    const rainfallAccumulation = await weatherService.getRainfallAccumulation(
      districtId,
      hoursValue
    );

    return sendSuccess(
      res,
      {
        data: weatherData,
        rainfallAccumulation,
        timeRange: {
          start: startTime,
          end: endTime,
          hours: hoursValue,
        },
      },
      'Weather data range retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get weather range error:', error);
    throw error;
  }
}

export async function getRainfallAccumulation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId, hours } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    const hoursValue = parseInt((hours as string) || '24', 10);

    if (hoursValue < 1 || hoursValue > 720) {
      throw new ValidationError('Hours must be between 1 and 720 (30 days)');
    }

    const accumulation = await weatherService.getRainfallAccumulation(
      districtId,
      hoursValue
    );

    return sendSuccess(
      res,
      {
        districtId,
        rainfallAccumulation: accumulation,
        timeframe: { hours: hoursValue },
      },
      'Rainfall accumulation calculated successfully'
    );
  } catch (error: any) {
    logger.error('Get rainfall accumulation error:', error);
    throw error;
  }
}
