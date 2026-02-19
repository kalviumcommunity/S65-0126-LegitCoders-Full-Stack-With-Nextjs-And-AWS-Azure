import { NextApiRequest, NextApiResponse } from 'next';
import { districtService } from '@services/district';
import { sendSuccess, sendError, sendPaginated } from '@utils/response';
import { ValidationError } from '@utils/errors';
import logger from '@utils/logger';

export async function createDistrict(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, state, latitude, longitude } = req.body;

    const district = await districtService.createDistrict({
      name,
      state,
      latitude,
      longitude,
    });

    return sendSuccess(res, district, 'District created successfully', 201);
  } catch (error: any) {
    logger.error('Create district error:', error);
    throw error;
  }
}

export async function getAllDistricts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    if (page < 1 || limit < 1) {
      throw new ValidationError('Page and limit must be positive numbers');
    }

    const { data, total } = await districtService.getAllDistricts(page, limit);

    return sendPaginated(res, data, total, page, limit, 'Districts retrieved successfully');
  } catch (error: any) {
    logger.error('Get all districts error:', error);
    throw error;
  }
}

export async function getDistrict(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('District ID is required');
    }

    const district = await districtService.getDistrictWithMetrics(id);
    return sendSuccess(res, district, 'District retrieved successfully');
  } catch (error: any) {
    logger.error('Get district error:', error);
    throw error;
  }
}

export async function updateDistrict(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('District ID is required');
    }

    const district = await districtService.updateDistrict(id, req.body);
    return sendSuccess(res, district, 'District updated successfully');
  } catch (error: any) {
    logger.error('Update district error:', error);
    throw error;
  }
}

export async function deleteDistrict(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('District ID is required');
    }

    await districtService.deleteDistrict(id);
    return sendSuccess(res, null, 'District deleted successfully');
  } catch (error: any) {
    logger.error('Delete district error:', error);
    throw error;
  }
}
