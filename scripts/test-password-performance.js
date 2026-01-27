#!/usr/bin/env node

/**
 * Password Hashing Performance Test
 * 
 * Tests bcrypt performance with different cost factors to verify
 * that cost factor 12 is acceptable for production use.
 * 
 * Usage:
 *   cd apps/web && node ../../scripts/test-password-performance.js
 *   OR
 *   npm run test:password-performance (from root)
 * 
 * Expected Results:
 * - Cost 10: ~100-150ms per hash
 * - Cost 12: ~400-600ms per hash (4x slower)
 * - Target: < 300ms for acceptable user experience
 */

// Try to require bcryptjs from the current directory structure
let bcrypt;
try {
  // First try from current directory (if run from apps/web)
  bcrypt = require('bcryptjs');
} catch (e) {
  try {
    // Try from apps/web if run from root
    bcrypt = require('../apps/web/node_modules/bcryptjs');
  } catch (e2) {
    console.error('Error: bcryptjs not found.');
    console.error('\nPlease run this script from the apps/web directory:');
    console.error('  cd apps/web && node ../../scripts/test-password-performance.js');
    console.error('\nOr ensure dependencies are installed:');
    console.error('  pnpm install');
    process.exit(1);
  }
}

const TEST_PASSWORD = 'SecurePassword123!';
const ITERATIONS = 10;

async function testCostFactor(cost) {
  console.log(`\nTesting bcrypt cost factor ${cost}:`);
  console.log('='.repeat(50));

  const times = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await bcrypt.hash(TEST_PASSWORD, cost);
    const end = performance.now();
    const duration = end - start;
    times.push(duration);

    process.stdout.write(`  Iteration ${i + 1}/${ITERATIONS}: ${duration.toFixed(2)}ms\r`);
  }

  console.log(); // New line after progress

  // Calculate statistics
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  console.log(`\nResults for cost ${cost}:`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Median:  ${median.toFixed(2)}ms`);
  console.log(`  Min:     ${min.toFixed(2)}ms`);
  console.log(`  Max:     ${max.toFixed(2)}ms`);

  // Recommendation
  if (avg < 300) {
    console.log(`  ✅ ACCEPTABLE - Average time under 300ms`);
  } else if (avg < 500) {
    console.log(`  ⚠️  MARGINAL - Average time 300-500ms (may affect UX)`);
  } else {
    console.log(`  ❌ TOO SLOW - Average time over 500ms (poor UX)`);
  }

  return { cost, avg, median, min, max };
}

async function testPasswordVerification(cost) {
  console.log(`\nTesting password verification with cost ${cost}:`);
  console.log('='.repeat(50));

  // First hash the password
  const hash = await bcrypt.hash(TEST_PASSWORD, cost);

  const times = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await bcrypt.compare(TEST_PASSWORD, hash);
    const end = performance.now();
    const duration = end - start;
    times.push(duration);

    process.stdout.write(`  Iteration ${i + 1}/${ITERATIONS}: ${duration.toFixed(2)}ms\r`);
  }

  console.log(); // New line

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\nVerification average: ${avg.toFixed(2)}ms`);

  return avg;
}

async function main() {
  console.log('Password Hashing Performance Test');
  console.log('==================================\n');
  console.log(`Testing with ${ITERATIONS} iterations per cost factor\n`);

  const results = [];

  // Test different cost factors
  for (const cost of [10, 11, 12, 13]) {
    const result = await testCostFactor(cost);
    results.push(result);

    // Also test verification time for current production cost (12)
    if (cost === 12) {
      await testPasswordVerification(cost);
    }
  }

  // Summary comparison
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY COMPARISON');
  console.log('='.repeat(50));

  results.forEach((result, i) => {
    const speedup = i > 0 ? (result.avg / results[0].avg).toFixed(2) : '1.00';
    console.log(`Cost ${result.cost}: ${result.avg.toFixed(2)}ms avg (${speedup}x slower than cost 10)`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(50));

  const cost12Result = results.find(r => r.cost === 12);
  if (cost12Result) {
    console.log(`\nCurrent production setting (cost 12):`);
    console.log(`  Average time: ${cost12Result.avg.toFixed(2)}ms`);

    if (cost12Result.avg < 300) {
      console.log(`  ✅ RECOMMENDED - Good balance of security and performance`);
    } else if (cost12Result.avg < 500) {
      console.log(`  ⚠️  ACCEPTABLE - Slight UX impact but still secure`);
      console.log(`  Consider monitoring actual login times in production`);
    } else {
      console.log(`  ❌ NOT RECOMMENDED - Too slow, consider cost 11`);
    }
  }

  console.log('\nNotes:');
  console.log('- Each increment in cost factor doubles the time');
  console.log('- Cost 12 is industry standard for 2026');
  console.log('- Target: < 300ms for good UX during login');
  console.log('- Monitor production metrics to verify performance');
}

main().catch(console.error);
