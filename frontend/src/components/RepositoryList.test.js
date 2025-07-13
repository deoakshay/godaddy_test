import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RepositoryList from '../components/RepositoryList';
import { repositoryService } from '../services/repositoryService';

// Mock the repository service
jest.mock('../services/repositoryService');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockRepositories = [
  {
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
  },
  {
    id: 2,
    name: 'test-repo-2',
    full_name: 'godaddy/test-repo-2',
    description: 'Test repository 2',
    html_url: 'https://github.com/godaddy/test-repo-2',
    language: 'Go',
    forks_count: 8,
    open_issues_count: 3,
    watchers_count: 20,
    stargazers_count: 25
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RepositoryList', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    repositoryService.getRepositories.mockClear();
  });

  it('renders loading state initially', () => {
    repositoryService.getRepositories.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<RepositoryList />);
    
    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
  });

  it('renders repositories after successful fetch', async () => {
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('GoDaddy Repositories')).toBeInTheDocument();
    });

    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.getByText('test-repo-2')).toBeInTheDocument();
    expect(screen.getByText('Test repository 1')).toBeInTheDocument();
    expect(screen.getByText('Test repository 2')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    repositoryService.getRepositories.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch repositories. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays repository information correctly', async () => {
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    // Check for language
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();

    // Check for stars
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    // Check for forks
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('navigates to repository detail when card is clicked', async () => {
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    const firstRepoCard = screen.getByText('test-repo-1').closest('.repo-card');
    fireEvent.click(firstRepoCard);

    expect(mockNavigate).toHaveBeenCalledWith('/repository/1');
  });

  it('handles repositories with missing data gracefully', async () => {
    const incompleteRepo = {
      id: 3,
      name: 'incomplete-repo',
      full_name: 'godaddy/incomplete-repo',
      description: null,
      html_url: 'https://github.com/godaddy/incomplete-repo',
      language: null,
      forks_count: 0,
      open_issues_count: 0,
      watchers_count: 0,
      stargazers_count: 0
    };

    repositoryService.getRepositories.mockResolvedValue([incompleteRepo]);
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('incomplete-repo')).toBeInTheDocument();
    });

    expect(screen.getByText('No description available')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();

  it('displays correct number of repositories', async () => {
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    
    renderWithRouter(<RepositoryList />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    const repoCards = screen.getAllByTestId('repo-card');
    expect(repoCards).toHaveLength(2);
  });
});
