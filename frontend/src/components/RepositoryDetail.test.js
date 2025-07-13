import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RepositoryDetail from '../components/RepositoryDetail';
import { repositoryService } from '../services/repositoryService';

// Mock the repository service
jest.mock('../services/repositoryService');

const mockRepository = {
  id: 1,
  name: 'test-repo-1',
  full_name: 'godaddy/test-repo-1',
  description: 'Test repository 1',
  html_url: 'https://github.com/godaddy/test-repo-1',
  language: 'JavaScript',
  forks_count: 5,
  open_issues_count: 2,
  watchers_count: 10,
  stargazers_count: 15
};

const renderWithRouter = (component, initialEntries = ['/repository/1']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('RepositoryDetail', () => {
  beforeEach(() => {
    repositoryService.getRepository.mockClear();
  });

  it('renders loading state initially', () => {
    repositoryService.getRepository.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<RepositoryDetail />);
    
    expect(screen.getByText('Loading repository details...')).toBeInTheDocument();
  });

  it('renders repository details after successful fetch', async () => {
    repositoryService.getRepository.mockResolvedValue(mockRepository);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test repository 1')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); 
    expect(screen.getByText('2')).toBeInTheDocument(); 
    expect(screen.getByText('10')).toBeInTheDocument(); 
    expect(screen.getByText('15')).toBeInTheDocument(); 
  });

  it('renders error message when fetch fails', async () => {
    repositoryService.getRepository.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch repository details. Please try again later.')).toBeInTheDocument();
    });
  });

  it('renders repository not found when repository is null', async () => {
    repositoryService.getRepository.mockResolvedValue(null);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Repository not found')).toBeInTheDocument();
    });
  });

  it('displays "No description available" when description is null', async () => {
    const repoWithoutDescription = {
      ...mockRepository,
      description: null
    };
    repositoryService.getRepository.mockResolvedValue(repoWithoutDescription);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('No description available')).toBeInTheDocument();
    });
  });

  it('displays "N/A" for missing language', async () => {
    const repoWithoutLanguage = {
      ...mockRepository,
      language: null
    };
    repositoryService.getRepository.mockResolvedValue(repoWithoutLanguage);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('renders GitHub link with correct attributes', async () => {
    repositoryService.getRepository.mockResolvedValue(mockRepository);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      const githubLink = screen.getByText('View on GitHub →');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/godaddy/test-repo-1');
      expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(githubLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders back button with correct link', async () => {
    repositoryService.getRepository.mockResolvedValue(mockRepository);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      const backButton = screen.getByText('← Back to Repositories');
      expect(backButton).toBeInTheDocument();
      expect(backButton.closest('a')).toHaveAttribute('href', '/');
    });
  });

  it('displays all statistics with correct labels', async () => {
    repositoryService.getRepository.mockResolvedValue(mockRepository);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('Primary Language')).toBeInTheDocument();
      expect(screen.getByText('Forks')).toBeInTheDocument();
      expect(screen.getByText('Open Issues')).toBeInTheDocument();
      expect(screen.getByText('Watchers')).toBeInTheDocument();
      expect(screen.getByText('Stars')).toBeInTheDocument();
    });
  });

  it('calls repositoryService.getRepository with correct ID from URL params', async () => {
    repositoryService.getRepository.mockResolvedValue(mockRepository);
    
    renderWithRouter(<RepositoryDetail />, ['/repository/123']);
    
    await waitFor(() => {
      expect(repositoryService.getRepository).toHaveBeenCalledWith('123');
    });
  });

  it('handles zero values in statistics correctly', async () => {
    const repoWithZeroStats = {
      ...mockRepository,
      forks_count: 0,
      open_issues_count: 0,
      watchers_count: 0,
      stargazers_count: 0
    };
    repositoryService.getRepository.mockResolvedValue(repoWithZeroStats);
    
    renderWithRouter(<RepositoryDetail />);
    
    await waitFor(() => {
      const statValues = screen.getAllByText('0');
      expect(statValues).toHaveLength(4); 
    });
  });
});
