const mockResponse = {
  status: 200,
  headers: { 'content-type': 'application/json' },
  time: 100,
  body: { success: true },
  json: function() { return this.body; }
};

// Just export stubs that resolve to the mock response
exports.get = () => Promise.resolve(mockResponse);
exports.post = () => Promise.resolve(mockResponse);
exports.put = () => Promise.resolve(mockResponse);
exports.del = () => Promise.resolve(mockResponse);
exports.patch = () => Promise.resolve(mockResponse);
exports.head = () => Promise.resolve(mockResponse);
exports.options = () => Promise.resolve(mockResponse);
