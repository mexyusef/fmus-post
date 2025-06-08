"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.client = client;
const axios_1 = __importDefault(require("axios"));
// Komentar: Fungsi dasar untuk membuat HTTP request
async function request(method, url, options) {
    const startTime = Date.now();
    try {
        // Komentar: Persiapkan opsi axios
        const axiosOptions = {
            method: method.toUpperCase(),
            url: url,
            headers: options?.headers || {},
            params: options?.params || {},
            data: options?.body || null,
            timeout: 30000,
            validateStatus: () => true // Komentar: Terima semua status code
        };
        // Komentar: Kirim request
        const axiosResponse = await (0, axios_1.default)(axiosOptions);
        const endTime = Date.now();
        // Komentar: Buat objek Response
        return {
            status: axiosResponse.status,
            time: endTime - startTime,
            headers: axiosResponse.headers,
            json: () => axiosResponse.data,
            text: () => {
                if (typeof axiosResponse.data === 'object') {
                    return JSON.stringify(axiosResponse.data);
                }
                return String(axiosResponse.data);
            }
        };
    }
    catch (error) {
        const endTime = Date.now();
        throw new Error(`Request failed: ${error.message}`);
    }
}
// Komentar: Implementasi HTTP GET
function get(url, options) {
    return request('GET', url, options);
}
// Komentar: Implementasi HTTP POST
function post(url, options) {
    return request('POST', url, options);
}
// Komentar: Implementasi HTTP PUT
function put(url, options) {
    return request('PUT', url, options);
}
// Komentar: Implementasi HTTP DELETE
function del(url, options) {
    return request('DELETE', url, options);
}
// Komentar: Implementasi client
function client(options) {
    // Komentar: Implementasi client yang lebih lengkap bisa ditambahkan nanti
    return {
        get,
        post,
        put,
        del
    };
}
//# sourceMappingURL=http.js.map