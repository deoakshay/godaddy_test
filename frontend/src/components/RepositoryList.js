import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repositoryService } from '../services/repositoryService';

const RepositoryList = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRepoClick = (repoId) => {
    navigate(`/repository/${repoId}`);
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const data = await repositoryService.getRepositories();
        setRepositories(data);
      } catch (err) {
        setError('Failed to fetch repositories. Please try again later.');
        console.error('Error fetching repositories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading repositories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        GoDaddy Repositories
      </h2>
      
      <div className="repo-grid">
        {repositories.map((repo) => (
          <div 
            key={repo.id} 
            className="repo-card"
            data-testid="repo-card"
            onClick={() => handleRepoClick(repo.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="repo-title">{repo.name}</div>
            <div className="repo-description">
              {repo.description || 'No description available'}
            </div>
            
            <div className="repo-stats">
              <div className="repo-language">
                {repo.language || 'Unknown'}
              </div>
              
              <div className="repo-metrics">
                <div className="metric">
                  <span>⭐</span>
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="metric">
                  <span>🔧</span>
                  <span>{repo.forks_count}</span>
                </div>
                <div className="metric">
                  <span>👁️</span>
                  <span>{repo.watchers_count}</span>
                </div>
                <div className="metric">
                  <span>🔍</span>
                  <span>{repo.open_issues_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;
