import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cacheGet, cacheSet } from '@/lib/redis'

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

    return NextResponse.json(district, { status: 201 })
  } catch (error) {
    console.error('Error creating district:', error)
    return NextResponse.json(
      { error: 'Failed to create district' },
      { status: 500 }
    )
  }
}
