import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryService } from '../services/repositoryService';

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        setLoading(true);
        const data = await repositoryService.getRepository(id);
        setRepository(data);
      } catch (err) {
        setError('Failed to fetch repository details. Please try again later.');
        console.error('Error fetching repository:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading repository details...</div>
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

  if (!repository) {
    return (
      <div className="container">
        <div className="error">Repository not found</div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Link to="/" className="back-button">
        ← Back to Repositories
      </Link>
      
      <div className="detail-card">
        <div className="detail-header">
          <h1 className="detail-title">{repository.name}</h1>
          <p className="detail-description">
            {repository.description || 'No description available'}
          </p>
          <a 
            href={repository.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="detail-link"
          >
            View on GitHub →
          </a>
        </div>

        <div className="detail-stats">
          <div className="stat-item">
            <div className="stat-value">{repository.language || 'N/A'}</div>
            <div className="stat-label">Primary Language</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{repository.forks_count}</div>
            <div className="stat-label">Forks</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{repository.open_issues_count}</div>
            <div className="stat-label">Open Issues</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{repository.watchers_count}</div>
            <div className="stat-label">Watchers</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{repository.stargazers_count}</div>
            <div className="stat-label">Stars</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryDetail;
