"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCollection = loadCollection;
exports.loadEnvironment = loadEnvironment;
exports.runCollection = runCollection;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const http_1 = require("./http");
// Komentar: Fungsi untuk memuat koleksi dari file
function loadCollection(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error loading collection: ${error.message}`));
        process.exit(1);
    }
}
// Komentar: Fungsi untuk memuat lingkungan dari file
function loadEnvironment(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        return JSON.parse(fileContent);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error loading environment: ${error.message}`));
        process.exit(1);
    }
}
// Komentar: Fungsi untuk menerapkan variabel lingkungan ke string
function applyVariables(text, variables) {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}
// Komentar: Fungsi untuk menjalankan koleksi
async function runCollection(collectionPath, environmentPath) {
    const collection = loadCollection(collectionPath);
    const environment = environmentPath ? loadEnvironment(environmentPath) : { name: '', variables: {} };
    // Komentar: Gabungkan variabel dari koleksi dan lingkungan
    const variables = {
        ...collection.variables || {},
        ...environment.variables
    };
    console.log(chalk_1.default.blue(`Running collection: ${collection.name}`));
    if (collection.description) {
        console.log(chalk_1.default.gray(collection.description));
    }
    console.log(chalk_1.default.gray(`Total requests: ${collection.requests.length}`));
    // Komentar: Hitung statistik awal
    let passedTests = 0;
    let failedTests = 0;
    let totalTests = 0;
    // Komentar: Jalankan setiap permintaan secara berurutan
    for (let i = 0; i < collection.requests.length; i++) {
        const request = collection.requests[i];
        console.log(chalk_1.default.yellow(`\n[${i + 1}/${collection.requests.length}] ${request.name}`));
        // Komentar: Terapkan variabel ke URL
        const url = applyVariables(request.url, variables);
        // Komentar: Terapkan variabel ke header
        const headers = {};
        if (request.headers) {
            for (const [key, value] of Object.entries(request.headers)) {
                headers[key] = applyVariables(value, variables);
            }
        }
        // Komentar: Terapkan variabel ke parameter
        const params = {};
        if (request.params) {
            for (const [key, value] of Object.entries(request.params)) {
                params[key] = applyVariables(value, variables);
            }
        }
        // Komentar: Terapkan variabel ke body jika ada
        let body = undefined;
        if (request.body) {
            if (typeof request.body === 'string') {
                body = applyVariables(request.body, variables);
            }
            else if (typeof request.body === 'object') {
                body = JSON.parse(applyVariables(JSON.stringify(request.body), variables));
            }
        }
        try {
            // Komentar: Kirim permintaan berdasarkan metode
            console.log(chalk_1.default.blue(`Sending ${request.method} request to ${url}...`));
            let response;
            switch (request.method) {
                case 'GET':
                    response = await (0, http_1.get)(url, { headers, params });
                    break;
                case 'POST':
                    response = await (0, http_1.post)(url, { headers, params, body });
                    break;
                case 'PUT':
                    response = await (0, http_1.put)(url, { headers, params, body });
                    break;
                case 'DELETE':
                    response = await (0, http_1.del)(url, { headers, params });
                    break;
                case 'PATCH':
                    // Komentar: Implementasi PATCH akan datang di versi berikutnya
                    console.error(chalk_1.default.red('PATCH method is not yet implemented'));
                    continue;
                default:
                    console.error(chalk_1.default.red(`Unsupported method: ${request.method}`));
                    continue;
            }
            console.log(chalk_1.default.green(`Status: ${response.status} (${response.time}ms)`));
            // Komentar: Verifikasi tes jika ada
            if (request.tests && request.tests.length > 0) {
                console.log(chalk_1.default.blue('\nRunning tests:'));
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
                                }
                                else if (test.path && test.assertion === 'equals' &&
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
                                        }
                                        else {
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
                            console.log(chalk_1.default.green(`✓ ${test.name}`));
                            passedTests++;
                        }
                        else {
                            console.log(chalk_1.default.red(`✗ ${test.name}`));
                            failedTests++;
                        }
                    }
                    catch (error) {
                        console.log(chalk_1.default.red(`✗ ${test.name} (Error: ${error.message})`));
                        failedTests++;
                    }
                }
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`Error executing request: ${error.message}`));
        }
    }
    // Komentar: Tampilkan ringkasan hasil
    console.log(chalk_1.default.blue('\nSummary:'));
    console.log(`Total Requests: ${collection.requests.length}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(chalk_1.default.green(`Passed Tests: ${passedTests}`));
    console.log(chalk_1.default.red(`Failed Tests: ${failedTests}`));
}
//# sourceMappingURL=collection.js.map