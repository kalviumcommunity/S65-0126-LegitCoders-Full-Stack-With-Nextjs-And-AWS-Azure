import { NextApiResponse } from 'next';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export function sendSuccess<T>(
  res: NextApiResponse<ApiResponse<T>>,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(
  res: NextApiResponse<ApiResponse>,
  message: string,
  statusCode: number = 400,
  error?: string
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  });
}

export function sendPaginated<T>(
  res: NextApiResponse,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Data retrieved successfully'
) {
  const pages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data,
    metadata: {
      total,
      page,
      limit,
      pages,
    },
    timestamp: new Date().toISOString(),
  });
}
