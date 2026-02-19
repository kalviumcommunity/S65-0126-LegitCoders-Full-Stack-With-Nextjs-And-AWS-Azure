import { prisma } from '@config/database';
import { weatherService } from './weather';
import logger from '@utils/logger';

export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface RiskAssessmentResult {
  score: number;
  riskLevel: RiskLevel;
  description: string;
}

export class RiskAssessmentService {
  /**
   * Risk thresholds
   */
  private thresholds = {
    low: { min: 0, max: 25 },
    moderate: { min: 26, max: 50 },
    high: { min: 51, max: 75 },
    critical: { min: 76, max: 100 },
  };

  /**
   * Calculate risk score based on weather data
   */
  async calculateRiskScore(districtId: string): Promise<RiskAssessmentResult> {
    try {
      // Get latest weather data
      const latestWeather = await weatherService.getLatestWeather(districtId);
      if (!latestWeather) {
        logger.warn(`No weather data available for district ${districtId}`);
        return {
          score: 0,
          riskLevel: RiskLevel.LOW,
          description: 'Insufficient weather data',
        };
      }

      // Get rainfall accumulation for 24 hours
      const rainfallAccumulation = await weatherService.getRainfallAccumulation(
        districtId,
        24
      );

      // Calculate score based on multiple factors
      let score = 0;

      // Factor 1: Recent rainfall intensity (0-40 points)
      // Assume >50mm in 1h is critical rainfall
      const rainfallScore = Math.min(
        40,
        (latestWeather.rainfall / 50) * 40
      );
      score += rainfallScore;

      // Factor 2: Rainfall accumulation (0-30 points)
      // Assume >200mm in 24h is critical
      const accumulationScore = Math.min(
        30,
        (rainfallAccumulation / 200) * 30
      );
      score += accumulationScore;

      // Factor 3: Humidity (0-20 points)
      // Higher humidity indicates ongoing rain probability
      const humidityScore = (latestWeather.humidity / 100) * 20;
      score += humidityScore;

      // Factor 4: Wind speed impact (0-10 points)
      // Strong winds can cause flooding by pushing water
      const windScore = Math.min(10, (latestWeather.windSpeed / 50) * 10);
      score += windScore;

      // Cap score at 100
      score = Math.min(100, score);

      const riskLevel = this.getRiskLevel(score);
      const description = this.getDescription(riskLevel, score, latestWeather);

      logger.info(`Risk assessment for district ${districtId}: score=${score}, level=${riskLevel}`);

      return {
        score: Math.round(score * 100) / 100, // Round to 2 decimals
        riskLevel,
        description,
      };
    } catch (error) {
      logger.error(`Error calculating risk score for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score <= this.thresholds.low.max) {
      return RiskLevel.LOW;
    } else if (score <= this.thresholds.moderate.max) {
      return RiskLevel.MODERATE;
    } else if (score <= this.thresholds.high.max) {
      return RiskLevel.HIGH;
    } else {
      return RiskLevel.CRITICAL;
    }
  }

  /**
   * Generate human-readable description
   */
  private getDescription(
    riskLevel: RiskLevel,
    score: number,
    weatherData: any
  ): string {
    const rainfall = weatherData.rainfall;
    const humidity = weatherData.humidity;

    const descriptions = {
      [RiskLevel.LOW]: `Low flood risk. Rainfall: ${rainfall}mm, Humidity: ${humidity}%`,
      [RiskLevel.MODERATE]: `Moderate flood risk. Increased rainfall detected. Rainfall: ${rainfall}mm, Humidity: ${humidity}%`,
      [RiskLevel.HIGH]: `High flood risk. Heavy rainfall ongoing. Rainfall: ${rainfall}mm, Humidity: ${humidity}%. Residents should be alert.`,
      [RiskLevel.CRITICAL]: `CRITICAL flood risk! Severe rainfall detected. Rainfall: ${rainfall}mm, Humidity: ${humidity}%. Immediate action required!`,
    };

    return descriptions[riskLevel];
  }

  /**
   * Store risk assessment in database
   */
  async storeRiskAssessment(
    districtId: string,
    assessment: RiskAssessmentResult
  ): Promise<any> {
    try {
      const stored = await prisma.riskAssessment.create({
        data: {
          districtId,
          riskLevel: assessment.riskLevel,
          score: assessment.score,
          description: assessment.description,
          calculatedAt: new Date(),
        },
      });

      logger.debug(`Stored risk assessment for district ${districtId}`);
      return stored;
    } catch (error) {
      logger.error(`Error storing risk assessment for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Get latest risk assessment
   */
  async getLatestRiskAssessment(districtId: string): Promise<any | null> {
    try {
      const latest = await prisma.riskAssessment.findFirst({
        where: { districtId },
        orderBy: { calculatedAt: 'desc' },
      });

      return latest;
    } catch (error) {
      logger.error(
        `Error fetching latest risk assessment for district ${districtId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get risk assessment history
   */
  async getRiskAssessmentHistory(
    districtId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const history = await prisma.riskAssessment.findMany({
        where: { districtId },
        orderBy: { calculatedAt: 'desc' },
        take: limit,
      });

      return history;
    } catch (error) {
      logger.error(
        `Error fetching risk assessment history for district ${districtId}:`,
        error
      );
      throw error;
    }
  }
}

export const riskAssessmentService = new RiskAssessmentService();
export default riskAssessmentService;
