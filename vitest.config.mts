import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  // Test configuration
  test: {
    // Global test utilities - makes describe, it, expect available globally
    globals: true,
    
    // Environment setup for different test scenarios
    environment: 'node', // Default environment
    
    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'build'
    ],
    
    // Coverage configuration with v8
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'text-summary',
        'html',
        'lcov',
        'json',
        'json-summary'
      ],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '__tests__/',
        'coverage/',
        'dist/',
        '.next/',
        'build/',
        '**/*.d.ts',
        '**/*.config.{js,ts,mjs,mts}',
        '**/index.{js,ts}',
        '**/*.stories.{js,ts,jsx,tsx}',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}'
      ],
      include: [
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      // Coverage thresholds
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      // Enable all coverage types
      all: true,
      clean: true,
      cleanOnRerun: true
    },
    
    // Setup files
    setupFiles: [
      './tests/setup.ts'
    ],
    
    // Global setup
    globalSetup: './tests/global-setup.ts',
    
    // Test timeout configurations
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    
    // Performance optimizations - Use forks instead of threads to avoid DataCloneError
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: undefined, // Auto-detect based on CPU cores
      }
    },
    
    // Reporter configuration
    reporters: [
      'default',
      'verbose'
    ],
    
    // Mock configurations
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Retry failed tests
    retry: 2,
    
    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,
    
    // Silent mode for cleaner output
    silent: false,
    
    // Custom matchers are defined in setup files to avoid worker thread serialization issues
  },
  
  // Vite configuration for test builds
  esbuild: {
    target: 'node14'
  },
  
  // Path resolution matching tsconfig.json
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/constants': resolve(__dirname, './src/constants'),
      '@/config': resolve(__dirname, './src/config'),
      '@/app': resolve(__dirname, './src/app'),
      '@/tests': resolve(__dirname, './tests'),
      // Mock aliases for testing
      '@/mocks': resolve(__dirname, './tests/mocks')
    }
  },
  
  // Define global constants for tests
  define: {
    __TEST__: true,
    __DEV__: true,
    'process.env.NODE_ENV': '"test"'
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event'
    ]
  },
  
  // Build configuration for tests
  build: {
    target: 'node14',
    sourcemap: true
  }
})