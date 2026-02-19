import { prisma } from '@config/database';
import { ConflictError, NotFoundError } from '@utils/errors';
import logger from '@utils/logger';

export interface CreateDistrictInput {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export class DistrictService {
  /**
   * Create a new district
   */
  async createDistrict(input: CreateDistrictInput): Promise<any> {
    try {
      // Check if district already exists
      const existing = await prisma.district.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new ConflictError(
          `District '${input.name}' already exists`
        );
      }

      const district = await prisma.district.create({
        data: {
          name: input.name,
          state: input.state,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });

      logger.info(`Created district: ${district.name}`);
      return district;
    } catch (error) {
      logger.error('Error creating district:', error);
      throw error;
    }
  }

  /**
   * Get district by ID
   */
  async getDistrictById(id: string): Promise<any> {
    try {
      const district = await prisma.district.findUnique({
        where: { id },
      });

      if (!district) {
        throw new NotFoundError(`District with ID ${id} not found`);
      }

      return district;
    } catch (error) {
      logger.error(`Error fetching district ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all districts with pagination
   */
  async getAllDistricts(
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        prisma.district.findMany({
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
        }),
        prisma.district.count(),
      ]);

      return { data, total };
    } catch (error) {
      logger.error('Error fetching districts:', error);
      throw error;
    }
  }

  /**
   * Get districts by state
   */
  async getDistrictsByState(state: string): Promise<any[]> {
    try {
      const districts = await prisma.district.findMany({
        where: { state },
        orderBy: { name: 'asc' },
      });

      return districts;
    } catch (error) {
      logger.error(`Error fetching districts for state ${state}:`, error);
      throw error;
    }
  }

  /**
   * Update district
   */
  async updateDistrict(id: string, input: Partial<CreateDistrictInput>): Promise<any> {
    try {
      const district = await prisma.district.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.state && { state: input.state }),
          ...(input.latitude && { latitude: input.latitude }),
          ...(input.longitude && { longitude: input.longitude }),
        },
      });

      logger.info(`Updated district: ${district.name}`);
      return district;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`District with ID ${id} not found`);
      }
      logger.error(`Error updating district ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete district
   */
  async deleteDistrict(id: string): Promise<any> {
    try {
      const district = await prisma.district.delete({
        where: { id },
      });

      logger.info(`Deleted district: ${district.name}`);
      return district;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`District with ID ${id} not found`);
      }
      logger.error(`Error deleting district ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get district with related data
   */
  async getDistrictWithMetrics(id: string): Promise<any> {
    try {
      const district = await prisma.district.findUnique({
        where: { id },
        include: {
          weatherData: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
          riskAssessments: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
          alerts: {
            where: { isActive: true },
          },
        },
      });

      if (!district) {
        throw new NotFoundError(`District with ID ${id} not found`);
      }

      return district;
    } catch (error) {
      logger.error(`Error fetching district metrics for ${id}:`, error);
      throw error;
    }
  }
}

export const districtService = new DistrictService();
export default districtService;
