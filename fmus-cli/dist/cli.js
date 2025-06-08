#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const http_1 = require("./http");
const collection_1 = require("./collection");
// Komentar: Program CLI utama
const program = new commander_1.Command();
// Komentar: Setup informasi program
program
    .name('fmus-post')
    .description('FMUS-POST Command Line Interface')
    .version('0.0.1');
// Komentar: Perintah untuk mengirim permintaan tunggal
program
    .command('request <method> <url>')
    .description('Make a single API request')
    .option('-h, --header <headers...>', 'HTTP headers in format "key:value"')
    .option('-p, --param <params...>', 'Query parameters in format "key:value"')
    .option('-b, --body <body>', 'Request body (JSON string)')
    .option('-a, --auth <auth>', 'Authentication in format "type:credentials"')
    .action(async (method, url, options) => {
    try {
        console.log(chalk_1.default.blue(`Sending ${method.toUpperCase()} request to ${url}...\n`));
        // Komentar: Parse opsi dari command line
        const headers = {};
        const params = {};
        if (options.header) {
            options.header.forEach((header) => {
                const [key, value] = header.split(':');
                headers[key.trim()] = value.trim();
            });
        }
        if (options.param) {
            options.param.forEach((param) => {
                const [key, value] = param.split(':');
                params[key.trim()] = value.trim();
            });
        }
        let body = undefined;
        if (options.body) {
            try {
                body = JSON.parse(options.body);
            }
            catch (e) {
                body = options.body;
            }
        }
        // Komentar: Kirim permintaan berdasarkan metode
        let response;
        switch (method.toLowerCase()) {
            case 'get':
                response = await (0, http_1.get)(url, { headers, params });
                break;
            case 'post':
                response = await (0, http_1.post)(url, { headers, params, body });
                break;
            case 'put':
                response = await (0, http_1.put)(url, { headers, params, body });
                break;
            case 'delete':
                response = await (0, http_1.del)(url, { headers, params });
                break;
            default:
                console.error(chalk_1.default.red(`Unsupported method: ${method}`));
                process.exit(1);
        }
        // Komentar: Tampilkan respons
        console.log(chalk_1.default.green(`Status: ${response.status} (${response.time}ms)`));
        console.log(chalk_1.default.yellow('Headers:'));
        console.log(JSON.stringify(response.headers, null, 2));
        console.log(chalk_1.default.yellow('\nBody:'));
        console.log(JSON.stringify(response.json(), null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Komentar: Perintah untuk menjalankan koleksi
program
    .command('collection <path>')
    .description('Run a collection from a JSON file')
    .option('-e, --env <environment>', 'Environment JSON file path')
    .action((path, options) => {
    try {
        (0, collection_1.runCollection)(path, options.env);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Komentar: Perintah untuk membuat koleksi baru
program
    .command('create')
    .description('Create a new collection interactively')
    .action(() => {
    console.log('Creating a new collection...');
    console.log('This command will be implemented in a future version.');
});
// Komentar: Parse argumen command line
program.parse(process.argv);
// Komentar: Tampilkan help jika tidak ada argumen yang diberikan
if (process.argv.length <= 2) {
    program.help();
}
//# sourceMappingURL=cli.js.map