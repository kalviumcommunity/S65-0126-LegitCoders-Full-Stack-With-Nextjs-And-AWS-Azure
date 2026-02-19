import { NextApiRequest, NextApiResponse } from 'next';
import { alertService } from '@services/alert';
import { sendSuccess, sendPaginated } from '@utils/response';
import { ValidationError } from '@utils/errors';
import logger from '@utils/logger';

export async function getActiveAlerts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    if (page < 1 || limit < 1) {
      throw new ValidationError('Page and limit must be positive numbers');
    }

    const { data, total } = await alertService.getActiveAlerts(page, limit);

    return sendPaginated(
      res,
      data,
      total,
      page,
      limit,
      'Active alerts retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get active alerts error:', error);
    throw error;
  }
}

export async function getAlertsByDistrict(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId } = req.query;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const activeOnly = (req.query.active as string) === 'true';

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    if (page < 1 || limit < 1) {
      throw new ValidationError('Page and limit must be positive numbers');
    }

    const { data, total } = await alertService.getDistrictAlerts(
      districtId,
      page,
      limit,
      activeOnly
    );

    return sendPaginated(
      res,
      data,
      total,
      page,
      limit,
      'District alerts retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get district alerts error:', error);
    throw error;
  }
}

export async function deactivateAlert(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('Alert ID is required');
    }

    const alert = await alertService.deactivateAlert(id);

    return sendSuccess(res, alert, 'Alert deactivated successfully');
  } catch (error: any) {
    logger.error('Deactivate alert error:', error);
    throw error;
  }
}

export async function getCriticalAlertsCount(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const count = await alertService.getCriticalAlertsCount();

    return sendSuccess(
      res,
      { criticalAlertsCount: count },
      'Critical alerts count retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get critical alerts count error:', error);
    throw error;
  }
}
