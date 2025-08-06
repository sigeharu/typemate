#!/usr/bin/env node

console.log('Testing Redis import...');

try {
  // Test different import methods
  console.log('Method 1: require');
  const redis1 = require('redis');
  console.log('✅ require success:', typeof redis1.createClient);
  
  console.log('Method 2: import');
  import('redis').then(redis2 => {
    console.log('✅ dynamic import success:', typeof redis2.createClient);
    
    // Test client creation
    const client = redis2.createClient();
    console.log('✅ client creation success:', typeof client);
    
    process.exit(0);
  }).catch(err => {
    console.log('❌ dynamic import failed:', err.message);
    process.exit(1);
  });
  
} catch (error) {
  console.log('❌ require failed:', error.message);
  process.exit(1);
}