import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis'

const CACHE_TTL = 300 // 5 minutes

export async function GET() {
  try {
    // Try to get from cache first
    const cacheKey = 'districts:all'
    const cached = await cacheGet(cacheKey)
    
    if (cached) {
      return NextResponse.json({
        data: cached,
        source: 'cache',
      })
    }

    // Fetch from database
    const districts = await prisma.district.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    // Cache the results
    await cacheSet(cacheKey, districts, CACHE_TTL)

    return NextResponse.json({
      data: districts,
      source: 'database',
    })
  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, state, latitude, longitude, riskLevel } = body

    // Validate required fields
    if (!name || !state || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      )
    }

    // Validate risk level if provided
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    if (riskLevel && !validRiskLevels.includes(riskLevel)) {
      return NextResponse.json(
        { error: 'Invalid risk level. Must be one of: LOW, MEDIUM, HIGH, CRITICAL' },
        { status: 400 }
      )
    }

    // Create new district
    const district = await prisma.district.create({
      data: {
        name,
        state,
        latitude,
        longitude,
        riskLevel: riskLevel || 'LOW',
      },
    })

    // Invalidate cache after creating new district
    await cacheDel('districts:all')

    return NextResponse.json(district, { status: 201 })
  } catch (error) {
    console.error('Error creating district:', error)
    return NextResponse.json(
      { error: 'Failed to create district' },
      { status: 500 }
    )
  }
}
