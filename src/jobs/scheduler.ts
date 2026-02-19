import cron from 'node-cron';
import { prisma } from '@config/database';
import { weatherService } from '@services/weather';
import { riskAssessmentService } from '@services/risk';
import { alertService } from '@services/alert';
import config from '@config/env';
import logger from '@utils/logger';

export class ScheduledJobs {
  /**
   * Start all scheduled jobs
   */
  static startAll() {
    logger.info('Starting scheduled jobs...');
    this.startWeatherFetchJob();
    this.startRiskCalculationJob();
    logger.info('Scheduled jobs started successfully');
  }

  /**
   * Weather fetch job - runs every 15 minutes
   */
  private static startWeatherFetchJob() {
    const interval = config.cron_job_interval || 15;
    const cronExpression = `*/${interval} * * * *`; // Every N minutes

    cron.schedule(cronExpression, async () => {
      try {
        logger.info('Weather fetch job started');
        await this.fetchWeatherForAllDistricts();
        logger.info('Weather fetch job completed');
      } catch (error) {
        logger.error('Weather fetch job failed:', error);
      }
    });

    logger.info(`Weather fetch job scheduled every ${interval} minutes`);
  }

  /**
   * Risk calculation job - runs every 15 minutes
   */
  private static startRiskCalculationJob() {
    const interval = config.cron_job_interval || 15;
    const cronExpression = `*/${interval} * * * *`;

    cron.schedule(cronExpression, async () => {
      try {
        logger.info('Risk calculation job started');
        await this.calculateRiskForAllDistricts();
        logger.info('Risk calculation job completed');
      } catch (error) {
        logger.error('Risk calculation job failed:', error);
      }
    });

    logger.info(`Risk calculation job scheduled every ${interval} minutes`);
  }

  /**
   * Fetch weather data for all districts
   */
  private static async fetchWeatherForAllDistricts() {
    try {
      const districts = await prisma.district.findMany();

      if (districts.length === 0) {
        logger.warn('No districts found for weather fetching');
        return;
      }

      const results = await Promise.allSettled(
        districts.map(async (district) => {
          try {
            const weatherData = await weatherService.fetchWeatherForDistrict(
              district.latitude,
              district.longitude,
              district.id
            );

            await weatherService.storeWeatherData(district.id, weatherData);

            logger.debug(
              `Weather data stored for district ${district.name}: ${weatherData.rainfall}mm rainfall`
            );
          } catch (error) {
            logger.error(
              `Failed to fetch weather for district ${district.name}:`,
              error
            );
          }
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      logger.info(
        `Weather fetch completed: ${successful} succeeded, ${failed} failed`
      );
    } catch (error) {
      logger.error('Error in fetchWeatherForAllDistricts:', error);
    }
  }

  /**
   * Calculate risk for all districts
   */
  private static async calculateRiskForAllDistricts() {
    try {
      const districts = await prisma.district.findMany();

      if (districts.length === 0) {
        logger.warn('No districts found for risk calculation');
        return;
      }

      const results = await Promise.allSettled(
        districts.map(async (district) => {
          try {
            // Calculate risk
            const assessment = await riskAssessmentService.calculateRiskScore(
              district.id
            );

            // Store assessment
            await riskAssessmentService.storeRiskAssessment(
              district.id,
              assessment
            );

            // Generate alert if risk is high or critical
            if (assessment.score >= 50) {
              await alertService.generateAlert(
                district.id,
                assessment.riskLevel,
                assessment.description
              );
            } else {
              // Deactivate alerts if risk has decreased
              await alertService.deactivateAlerts(district.id);
            }

            logger.debug(
              `Risk calculated for district ${district.name}: ${assessment.riskLevel} (${assessment.score})`
            );
          } catch (error) {
            logger.error(
              `Failed to calculate risk for district ${district.name}:`,
              error
            );
          }
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      logger.info(
        `Risk calculation completed: ${successful} succeeded, ${failed} failed`
      );
    } catch (error) {
      logger.error('Error in calculateRiskForAllDistricts:', error);
    }
  }

  /**
   * Manual trigger for weather fetch
   */
  static async triggerWeatherFetch() {
    logger.info('Manual weather fetch triggered');
    await this.fetchWeatherForAllDistricts();
  }

  /**
   * Manual trigger for risk calculation
   */
  static async triggerRiskCalculation() {
    logger.info('Manual risk calculation triggered');
    await this.calculateRiskForAllDistricts();
  }
}

export default ScheduledJobs;
