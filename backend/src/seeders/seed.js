require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Policy, Claim, ClaimDocument, ClaimNote } = require('../database/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      role: 'user',
      phone: '+1234567890',
      address: '123 Main St, New York, NY 10001'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash,
      role: 'user',
      phone: '+1234567891',
      address: '456 Oak Ave, Los Angeles, CA 90001'
    });

    const insurer = await User.create({
      name: 'Insurance Manager',
      email: 'insurer@example.com',
      passwordHash,
      role: 'insurer',
      phone: '+1234567892'
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      phone: '+1234567893'
    });

    console.log('✓ Users created');

    // Create policies
    const healthPolicy1 = await Policy.create({
      policyNumber: 'HLTH-2024-001',
      userId: user1.id,
      insurerId: insurer.id,
      type: 'health',
      coverageAmount: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'active',
      details: {
        deductible: 1000,
        coinsurance: 20
      }
    });

    const vehiclePolicy1 = await Policy.create({
      policyNumber: 'VEH-2024-001',
      userId: user1.id,
      insurerId: insurer.id,
      type: 'vehicle',
      coverageAmount: 100000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'active',
      details: {
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        year: 2022
      }
    });

    const healthPolicy2 = await Policy.create({
      policyNumber: 'HLTH-2024-002',
      userId: user2.id,
      insurerId: insurer.id,
      type: 'health',
      coverageAmount: 75000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'active',
      details: {
        deductible: 500,
        coinsurance: 15
      }
    });

    console.log('✓ Policies created');

    // Create sample claims
    const claim1 = await Claim.create({
      claimNumber: 'CLM-2024-001',
      policyId: healthPolicy1.id,
      userId: user1.id,
      type: 'health',
      amountClaimed: 3500,
      amountApproved: 3500,
      incidentDate: new Date('2024-10-15'),
      description: 'Emergency room visit for severe chest pain. Underwent ECG and blood tests.',
      status: 'approved',
      autoApproved: true
    });

    const claim2 = await Claim.create({
      claimNumber: 'CLM-2024-002',
      policyId: vehiclePolicy1.id,
      userId: user1.id,
      type: 'vehicle',
      amountClaimed: 8500,
      incidentDate: new Date('2024-10-20'),
      description: 'Rear-end collision at intersection. Damage to rear bumper and taillight.',
      status: 'under_review'
    });

    const claim3 = await Claim.create({
      claimNumber: 'CLM-2024-003',
      policyId: healthPolicy2.id,
      userId: user2.id,
      type: 'health',
      amountClaimed: 1200,
      amountApproved: 1200,
      incidentDate: new Date('2024-10-18'),
      description: 'Dental treatment - root canal procedure.',
      status: 'approved',
      autoApproved: true
    });

    const claim4 = await Claim.create({
      claimNumber: 'CLM-2024-004',
      policyId: healthPolicy1.id,
      userId: user1.id,
      type: 'health',
      amountClaimed: 25000,
      incidentDate: new Date('2024-10-22'),
      description: 'Surgical procedure for appendicitis. Three-day hospital stay required.',
      status: 'submitted'
    });

    console.log('✓ Claims created');

    // Create sample notes
    await ClaimNote.create({
      claimId: claim2.id,
      authorId: insurer.id,
      note: 'Reviewing police report and damage assessment. Please provide additional photos of the damage.',
      isInternal: false
    });

    await ClaimNote.create({
      claimId: claim2.id,
      authorId: insurer.id,
      note: 'Internal note: Check for prior claims history.',
      isInternal: true
    });

    console.log('✓ Claim notes created');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User 1:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');
    console.log('  Policies: HLTH-2024-001, VEH-2024-001\n');
    console.log('User 2:');
    console.log('  Email: jane@example.com');
    console.log('  Password: password123');
    console.log('  Policies: HLTH-2024-002\n');
    console.log('Insurer:');
    console.log('  Email: insurer@example.com');
    console.log('  Password: password123\n');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
