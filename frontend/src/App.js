import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RepositoryList from './components/RepositoryList';
import RepositoryDetail from './components/RepositoryDetail';

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>GoDaddy Repository Viewer</h1>
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={<RepositoryList />} />
        <Route path="/repository/:id" element={<RepositoryDetail />} />
      </Routes>
    </div>
  );
}

export default App;
