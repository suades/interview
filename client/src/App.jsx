import { useState } from 'react';
import './styles/App.css';

const FMRIAnalysis = () => {
  const [matrix, setMatrix] = useState([
    [0, 1, 0.5, 0.3],
    [1, 0, 0.8, 0.4],
    [0.5, 0.8, 0, 0.6],
    [0.3, 0.4, 0.6, 0]
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(4);

  const updateMatrixSize = (newSize) => {
    const currentSize = matrix.length;
    if (newSize > currentSize) {
      const newMatrix = [...matrix.map(row => [...row])];
      newMatrix.forEach(row => {
        while (row.length < newSize) {
          row.push(0);
        }
      });
      while (newMatrix.length < newSize) {
        newMatrix.push(new Array(newSize).fill(0));
      }
      setMatrix(newMatrix);
    } else if (newSize < currentSize) {
      const newMatrix = matrix
        .slice(0, newSize)
        .map(row => row.slice(0, newSize));
      setMatrix(newMatrix);
    }
    setSize(newSize);
  };

  const processMatrix = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/process-matrix', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matrix }),
      });
      
      if (!response.ok) {
        throw new Error('Processing failed: ' + (await response.text()));
      }
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/delete-session/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Delete failed: ' + (await response.text()));
      }
      
      setSessionId(null);
      setResults(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatrixChange = (rowIndex, colIndex, value) => {
    const newValue = value === '' ? 0 : Number(value);
    if (isNaN(newValue)) return;
    
    const newMatrix = matrix.map((row, i) =>
      i === rowIndex
        ? row.map((cell, j) => (j === colIndex ? newValue : cell))
        : row
    );
    setMatrix(newMatrix);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header className="app-header">
          <h1>fMRI Connectivity Matrix Analysis</h1>
          <p className="header-description">
            Analyze brain connectivity data from fMRI scans
          </p>
        </header>

        <div className="matrix-container">
          <div className="matrix-controls">
            <label className="control-label">Matrix Size:</label>
            <select 
              value={size} 
              onChange={(e) => updateMatrixSize(Number(e.target.value))}
              className="size-select"
            >
              {[2,3,4,5,6].map(n => (
                <option key={n} value={n}>{n}x{n}</option>
              ))}
            </select>
          </div>

          <div className="matrix-input-section">
            <h2>Input Matrix</h2>
            <div className="matrix-scroll">
              <div className="matrix-wrapper">
                {matrix.map((row, i) => (
                  <div key={i} className="matrix-row">
                    {row.map((cell, j) => (
                      <input
                        key={j}
                        type="number"
                        value={cell}
                        onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                        className="matrix-cell"
                        step="0.1"
                        min="0"
                        max="1"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button 
              onClick={processMatrix} 
              disabled={isLoading}
              className="process-button"
            >
              {isLoading ? 'Processing...' : 'Process Matrix'}
            </button>
            {sessionId && (
              <button 
                onClick={deleteSession}
                disabled={isLoading}
                className="delete-button"
              >
                Delete Session
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <p className="session-info">Session ID: <span>{sessionId}</span></p>
            </div>
            
            <div className="result-section">
              <h3>Degree Matrix</h3>
              <div className="result-array">
                {results.degreeMatrix.map((value, i) => (
                  <span key={i} className="result-value">
                    {value.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>
                Highest Connectivity Row (Index: {results.maxRowIndex})
              </h3>
              <div className="result-array">
                {results.sortedMaxRow.map((value, i) => (
                  <span key={i} className="result-value">
                    {value.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FMRIAnalysis;