import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.alert.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  await prisma.weatherData.deleteMany({});
  await prisma.district.deleteMany({});

  // Create sample districts (flood-prone areas in India)
  const districts = await Promise.all([
    prisma.district.create({
      data: {
        name: 'Belgaum',
        state: 'Karnataka',
        latitude: 15.8666,
        longitude: 75.6333,
      },
    }),
    prisma.district.create({
      data: {
        name: 'Assam Valley',
        state: 'Assam',
        latitude: 26.2006,
        longitude: 92.9376,
      },
    }),
    prisma.district.create({
      data: {
        name: 'Jamshedpur',
        state: 'Jharkhand',
        latitude: 22.8045,
        longitude: 86.1829,
      },
    }),
    prisma.district.create({
      data: {
        name: 'Kerala District',
        state: 'Kerala',
        latitude: 10.3528,
        longitude: 76.5120,
      },
    }),
    prisma.district.create({
      data: {
        name: 'North Bihar',
        state: 'Bihar',
        latitude: 26.8124,
        longitude: 85.1373,
      },
    }),
  ]);

  console.log(`Created ${districts.length} districts`);

  // Add sample weather data for the first district
  if (districts.length > 0) {
    await prisma.weatherData.create({
      data: {
        districtId: districts[0].id,
        rainfall: 45.5,
        temperature: 28.5,
        humidity: 72,
        windSpeed: 12.3,
        recordedAt: new Date(),
      },
    });

    // Create a sample risk assessment
    await prisma.riskAssessment.create({
      data: {
        districtId: districts[0].id,
        riskLevel: 'MODERATE',
        score: 35.5,
        description: 'Moderate flood risk. Sample data for testing.',
        calculatedAt: new Date(),
      },
    });
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
