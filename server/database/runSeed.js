const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'embroidery_db',
});

async function runSeed() {
  const client = await pool.connect();
  try {
    // Run schema
    console.log('📦 Creating tables...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tables created successfully');

    // Generate proper bcrypt hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const empHash = await bcrypt.hash('emp123', 10);
    const accHash = await bcrypt.hash('acc123', 10);

    // Read seed file and replace placeholder hashes
    let seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    
    // Replace the placeholder hashes with real ones
    const placeholderHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    // Replace in order: admin, employee, accountant
    let count = 0;
    seed = seed.replace(new RegExp(placeholderHash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => {
      count++;
      if (count === 1) return adminHash;
      if (count === 2) return empHash;
      return accHash;
    });

    console.log('🌱 Seeding data...');
    await client.query(seed);
    console.log('✅ Seed data inserted successfully');

    console.log('\n📋 Login Credentials:');
    console.log('  Admin:      username=admin,      password=admin123');
    console.log('  Employee:   username=rahul_emp,   password=emp123');
    console.log('  Accountant: username=priya_acc,   password=acc123');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
