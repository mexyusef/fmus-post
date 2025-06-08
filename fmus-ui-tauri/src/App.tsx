import { useState } from 'react';
import './App.css';

function App() {
  const [requestUrl, setRequestUrl] = useState('https://api.example.com/users');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Komentar: Fungsi untuk mengirim permintaan API
  const sendRequest = async () => {
    setIsLoading(true);
    try {
      // Komentar: Nanti akan menggunakan fmus-post
      const res = await fetch(requestUrl);
      const data = await res.json();
      setResponse({
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
        time: 0 // Komentar: Akan diimplementasikan dengan perhitungan waktu
      });
    } catch (error) {
      setResponse({
        error: (error as Error).message
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>FMUS-POST</h1>
      <div className="request-panel">
        <div className="request-header">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="text"
            value={requestUrl}
            onChange={(e) => setRequestUrl(e.target.value)}
            placeholder="Enter URL"
            className="url-input"
          />
          <button
            onClick={sendRequest}
            disabled={isLoading}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="tabs">
          <button className="tab active">Params</button>
          <button className="tab">Headers</button>
          <button className="tab">Body</button>
          <button className="tab">Auth</button>
        </div>
        <div className="tab-content">
          {/* Komentar: Konten tab akan diimplementasikan nanti */}
          <p>Request configuration will go here</p>
        </div>
      </div>

      <div className="response-panel">
        <h2>Response</h2>
        {response ? (
          <div className="response-content">
            <div className="response-meta">
              <span className={`status ${response.status < 400 ? 'success' : 'error'}`}>
                {response.status || 'Error'}
              </span>
              <span className="time">{response.time || 0} ms</span>
            </div>
            <div className="tabs">
              <button className="tab active">Body</button>
              <button className="tab">Headers</button>
              <button className="tab">Preview</button>
            </div>
            <div className="response-body">
              <pre>{response.error ? response.error : JSON.stringify(response.body, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="empty-response">No response yet</div>
        )}
      </div>
    </div>
  );
}

export default App;
