import { prisma } from '@config/database';
import { RiskLevel } from './risk';
import logger from '@utils/logger';

export class AlertService {
  /**
   * Generate or update alert based on risk level
   */
  async generateAlert(
    districtId: string,
    riskLevel: RiskLevel,
    message: string
  ): Promise<any> {
    try {
      // Only create alerts for HIGH and CRITICAL risk levels
      if (riskLevel !== RiskLevel.HIGH && riskLevel !== RiskLevel.CRITICAL) {
        // Deactivate existing high/critical alerts if risk is lower
        await this.deactivateAlerts(districtId);
        return null;
      }

      // Check if active alert already exists for this district
      const existingAlert = await this.getActiveAlert(districtId);

      if (existingAlert) {
        // Update existing alert if risk level is same or higher
        if (this.compareRiskLevels(riskLevel, existingAlert.riskLevel) >= 0) {
          const updated = await prisma.alert.update({
            where: { id: existingAlert.id },
            data: {
              message,
              riskLevel,
              updatedAt: new Date(),
            },
          });

          logger.info(
            `Updated alert for district ${districtId} to level ${riskLevel}`
          );
          return updated;
        }

        return existingAlert;
      }

      // Create new alert
      const newAlert = await prisma.alert.create({
        data: {
          districtId,
          message,
          riskLevel,
          isActive: true,
        },
      });

      logger.warn(
        `Created new alert for district ${districtId} with level ${riskLevel}`
      );
      return newAlert;
    } catch (error) {
      logger.error(
        `Error generating alert for district ${districtId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Compare risk levels and return relative value
   */
  private compareRiskLevels(level1: RiskLevel, level2: RiskLevel): number {
    const levels = {
      [RiskLevel.LOW]: 0,
      [RiskLevel.MODERATE]: 1,
      [RiskLevel.HIGH]: 2,
      [RiskLevel.CRITICAL]: 3,
    };

    return levels[level1] - levels[level2];
  }

  /**
   * Get active alert for district
   */
  async getActiveAlert(districtId: string): Promise<any | null> {
    try {
      const alert = await prisma.alert.findFirst({
        where: {
          districtId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return alert;
    } catch (error) {
      logger.error(`Error fetching active alert for district ${districtId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate all alerts for district
   */
  async deactivateAlerts(districtId: string): Promise<any> {
    try {
      const result = await prisma.alert.updateMany({
        where: {
          districtId,
          isActive: true,
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      if (result.count > 0) {
        logger.info(`Deactivated ${result.count} alerts for district ${districtId}`);
      }

      return result;
    } catch (error) {
      logger.error(
        `Error deactivating alerts for district ${districtId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Deactivate specific alert
   */
  async deactivateAlert(alertId: string): Promise<any> {
    try {
      const alert = await prisma.alert.update({
        where: { id: alertId },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      logger.info(`Deactivated alert ${alertId}`);
      return alert;
    } catch (error) {
      logger.error(`Error deactivating alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active alerts with pagination
   */
  async getActiveAlerts(
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.alert.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            district: true,
          },
        }),
        prisma.alert.count({
          where: { isActive: true },
        }),
      ]);

      return { data, total };
    } catch (error) {
      logger.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  /**
   * Get alerts for specific district
   */
  async getDistrictAlerts(
    districtId: string,
    page: number = 1,
    limit: number = 20,
    activeOnly: boolean = true
  ): Promise<{ data: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const where = activeOnly ? { districtId, isActive: true } : { districtId };

      const [data, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.alert.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      logger.error(
        `Error fetching alerts for district ${districtId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get high/critical alerts count
   */
  async getCriticalAlertsCount(): Promise<number> {
    try {
      const count = await prisma.alert.count({
        where: {
          isActive: true,
          riskLevel: {
            in: [RiskLevel.HIGH, RiskLevel.CRITICAL],
          },
        },
      });

      return count;
    } catch (error) {
      logger.error('Error counting critical alerts:', error);
      throw error;
    }
  }
}

export const alertService = new AlertService();
export default alertService;
