import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { get, post, put, del } from './http';

// Komentar: Antarmuka untuk koleksi
interface Collection {
  name: string;
  description?: string;
  requests: Request[];
  variables?: Record<string, string>;
}

// Komentar: Antarmuka untuk permintaan dalam koleksi
interface Request {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  tests?: Test[];
}

// Komentar: Antarmuka untuk tes dalam permintaan
interface Test {
  name: string;
  type: 'status' | 'header' | 'body' | 'responseTime';
  assertion: 'equals' | 'contains' | 'exists' | 'matches' | 'lessThan' | 'greaterThan';
  path?: string;
  value?: any;
}

// Komentar: Antarmuka untuk lingkungan
interface Environment {
  name: string;
  variables: Record<string, string>;
}

// Komentar: Fungsi untuk memuat koleksi dari file
export function loadCollection(filePath: string): Collection {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(fileContent) as Collection;
  } catch (error: any) {
    console.error(chalk.red(`Error loading collection: ${error.message}`));
    process.exit(1);
  }
}

// Komentar: Fungsi untuk memuat lingkungan dari file
export function loadEnvironment(filePath: string): Environment {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(fileContent) as Environment;
  } catch (error: any) {
    console.error(chalk.red(`Error loading environment: ${error.message}`));
    process.exit(1);
  }
}

// Komentar: Fungsi untuk menerapkan variabel lingkungan ke string
function applyVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

// Komentar: Fungsi untuk menjalankan koleksi
export async function runCollection(collectionPath: string, environmentPath?: string): Promise<void> {
  const collection = loadCollection(collectionPath);
  const environment = environmentPath ? loadEnvironment(environmentPath) : { name: '', variables: {} };

  // Komentar: Gabungkan variabel dari koleksi dan lingkungan
  const variables = {
    ...collection.variables || {},
    ...environment.variables
  };

  console.log(chalk.blue(`Running collection: ${collection.name}`));

  if (collection.description) {
    console.log(chalk.gray(collection.description));
  }

  console.log(chalk.gray(`Total requests: ${collection.requests.length}`));

  // Komentar: Hitung statistik awal
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  // Komentar: Jalankan setiap permintaan secara berurutan
  for (let i = 0; i < collection.requests.length; i++) {
    const request = collection.requests[i];

    console.log(chalk.yellow(`\n[${i + 1}/${collection.requests.length}] ${request.name}`));

    // Komentar: Terapkan variabel ke URL
    const url = applyVariables(request.url, variables);

    // Komentar: Terapkan variabel ke header
    const headers: Record<string, string> = {};
    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        headers[key] = applyVariables(value, variables);
      }
    }

    // Komentar: Terapkan variabel ke parameter
    const params: Record<string, string> = {};
    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        params[key] = applyVariables(value, variables);
      }
    }

    // Komentar: Terapkan variabel ke body jika ada
    let body: any = undefined;
    if (request.body) {
      if (typeof request.body === 'string') {
        body = applyVariables(request.body, variables);
      } else if (typeof request.body === 'object') {
        body = JSON.parse(
          applyVariables(JSON.stringify(request.body), variables)
        );
      }
    }

    try {
      // Komentar: Kirim permintaan berdasarkan metode
      console.log(chalk.blue(`Sending ${request.method} request to ${url}...`));
      let response;

      switch (request.method) {
        case 'GET':
          response = await get(url, { headers, params });
          break;
        case 'POST':
          response = await post(url, { headers, params, body });
          break;
        case 'PUT':
          response = await put(url, { headers, params, body });
          break;
        case 'DELETE':
          response = await del(url, { headers, params });
          break;
        case 'PATCH':
          // Komentar: Implementasi PATCH akan datang di versi berikutnya
          console.error(chalk.red('PATCH method is not yet implemented'));
          continue;
        default:
          console.error(chalk.red(`Unsupported method: ${request.method}`));
          continue;
      }

      console.log(chalk.green(`Status: ${response.status} (${response.time}ms)`));

      // Komentar: Verifikasi tes jika ada
      if (request.tests && request.tests.length > 0) {
        console.log(chalk.blue('\nRunning tests:'));

        for (const test of request.tests) {
          totalTests++;

          try {
            let passed = false;
            const responseBody = response.json();

            switch (test.type) {
              case 'status':
                if (test.assertion === 'equals' && response.status === test.value) {
                  passed = true;
                }
                break;
              case 'responseTime':
                if (test.assertion === 'lessThan' && response.time < test.value) {
                  passed = true;
                }
                break;
              case 'header':
                if (test.path && test.assertion === 'exists' && response.headers[test.path]) {
                  passed = true;
                } else if (test.path && test.assertion === 'equals' &&
                           response.headers[test.path] === test.value) {
                  passed = true;
                }
                break;
              case 'body':
                if (test.path && test.assertion === 'exists') {
                  // Komentar: Implementasi sederhana untuk path
                  const keys = test.path.split('.');
                  let value = responseBody;

                  for (const key of keys) {
                    if (value && typeof value === 'object' && key in value) {
                      value = value[key];
                    } else {
                      value = undefined;
                      break;
                    }
                  }

                  if (value !== undefined) {
                    passed = true;
                  }
                }
                break;
            }

            if (passed) {
              console.log(chalk.green(`✓ ${test.name}`));
              passedTests++;
            } else {
              console.log(chalk.red(`✗ ${test.name}`));
              failedTests++;
            }
          } catch (error: any) {
            console.log(chalk.red(`✗ ${test.name} (Error: ${error.message})`));
            failedTests++;
          }
        }
      }

    } catch (error: any) {
      console.error(chalk.red(`Error executing request: ${error.message}`));
    }
  }

  // Komentar: Tampilkan ringkasan hasil
  console.log(chalk.blue('\nSummary:'));
  console.log(`Total Requests: ${collection.requests.length}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(chalk.green(`Passed Tests: ${passedTests}`));
  console.log(chalk.red(`Failed Tests: ${failedTests}`));
}
