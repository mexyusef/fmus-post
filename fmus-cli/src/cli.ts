#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { get, post, put, del, client } from './http';
import { runCollection } from './collection';

// Komentar: Tipe untuk opsi request
interface RequestOptions {
  header?: string[];
  param?: string[];
  body?: string;
  auth?: string;
}

// Komentar: Tipe untuk opsi collection
interface CollectionOptions {
  env?: string;
}

// Komentar: Program CLI utama
const program = new Command();

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
  .action(async (method: string, url: string, options: RequestOptions) => {
    try {
      console.log(chalk.blue(`Sending ${method.toUpperCase()} request to ${url}...\n`));

      // Komentar: Parse opsi dari command line
      const headers: Record<string, string> = {};
      const params: Record<string, string> = {};

      if (options.header) {
        options.header.forEach((header: string) => {
          const [key, value] = header.split(':');
          headers[key.trim()] = value.trim();
        });
      }

      if (options.param) {
        options.param.forEach((param: string) => {
          const [key, value] = param.split(':');
          params[key.trim()] = value.trim();
        });
      }

      let body = undefined;
      if (options.body) {
        try {
          body = JSON.parse(options.body);
        } catch (e) {
          body = options.body;
        }
      }

      // Komentar: Kirim permintaan berdasarkan metode
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await get(url, { headers, params });
          break;
        case 'post':
          response = await post(url, { headers, params, body });
          break;
        case 'put':
          response = await put(url, { headers, params, body });
          break;
        case 'delete':
          response = await del(url, { headers, params });
          break;
        default:
          console.error(chalk.red(`Unsupported method: ${method}`));
          process.exit(1);
      }

      // Komentar: Tampilkan respons
      console.log(chalk.green(`Status: ${response.status} (${response.time}ms)`));
      console.log(chalk.yellow('Headers:'));
      console.log(JSON.stringify(response.headers, null, 2));
      console.log(chalk.yellow('\nBody:'));
      console.log(JSON.stringify(response.json(), null, 2));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Komentar: Perintah untuk menjalankan koleksi
program
  .command('collection <path>')
  .description('Run a collection from a JSON file')
  .option('-e, --env <environment>', 'Environment JSON file path')
  .action((path: string, options: CollectionOptions) => {
    try {
      runCollection(path, options.env);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
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
