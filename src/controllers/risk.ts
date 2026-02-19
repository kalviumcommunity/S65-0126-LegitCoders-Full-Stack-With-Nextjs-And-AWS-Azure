import { NextApiRequest, NextApiResponse } from 'next';
import { riskAssessmentService } from '@services/risk';
import { weatherService } from '@services/weather';
import { districtService } from '@services/district';
import { sendSuccess, sendPaginated } from '@utils/response';
import { ValidationError } from '@utils/errors';
import logger from '@utils/logger';

export async function calculateAndStoreRisk(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    // Verify district exists
    await districtService.getDistrictById(districtId);

    // Calculate risk score
    const assessment = await riskAssessmentService.calculateRiskScore(districtId);

    // Store in database
    const stored = await riskAssessmentService.storeRiskAssessment(
      districtId,
      assessment
    );

    return sendSuccess(
      res,
      stored,
      'Risk assessment calculated and stored successfully',
      201
    );
  } catch (error: any) {
    logger.error('Calculate risk error:', error);
    throw error;
  }
}

export async function getRiskAssessment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    // Verify district exists
    await districtService.getDistrictById(districtId);

    const assessment = await riskAssessmentService.getLatestRiskAssessment(
      districtId
    );

    if (!assessment) {
      return sendSuccess(
        res,
        null,
        'No risk assessment available. Run assessment first.',
        200
      );
    }

    return sendSuccess(res, assessment, 'Risk assessment retrieved successfully');
  } catch (error: any) {
    logger.error('Get risk assessment error:', error);
    throw error;
  }
}

export async function getRiskHistory(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { districtId, limit } = req.query;

    if (!districtId || typeof districtId !== 'string') {
      throw new ValidationError('District ID is required');
    }

    // Verify district exists
    await districtService.getDistrictById(districtId);

    const limitValue = parseInt((limit as string) || '10', 10);

    if (limitValue < 1 || limitValue > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const history = await riskAssessmentService.getRiskAssessmentHistory(
      districtId,
      limitValue
    );

    return sendSuccess(
      res,
      history,
      'Risk assessment history retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get risk history error:', error);
    throw error;
  }
}

export async function getRiskForAllDistricts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    if (page < 1 || limit < 1) {
      throw new ValidationError('Page and limit must be positive numbers');
    }

    const { data: districts, total } = await districtService.getAllDistricts(
      page,
      limit
    );

    // Get latest risk assessment for each district
    const risks = await Promise.all(
      districts.map(async (district) => ({
        district,
        risk: await riskAssessmentService.getLatestRiskAssessment(district.id),
      }))
    );

    return sendPaginated(
      res,
      risks,
      total,
      page,
      limit,
      'Risk assessments for all districts retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Get risk for all districts error:', error);
    throw error;
  }
}
