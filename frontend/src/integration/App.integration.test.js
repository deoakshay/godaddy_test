import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';
import { repositoryService } from '../services/repositoryService';

// Mock the repository service
jest.mock('../services/repositoryService');

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

const renderApp = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    repositoryService.getRepositories.mockClear();
    repositoryService.getRepository.mockClear();
  });

  it('navigates from repository list to repository detail', async () => {
    // Mock the service calls
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    repositoryService.getRepository.mockResolvedValue(mockRepositories[0]);

    renderApp(['/']);

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    // Click on the first repository
    const firstRepoCard = screen.getByText('test-repo-1').closest('.repo-card');
    fireEvent.click(firstRepoCard);

    // Wait for repository detail to load
    await waitFor(() => {
      expect(screen.getByText('← Back to Repositories')).toBeInTheDocument();
    });

    // Verify we're on the detail page
    expect(screen.getByText('Primary Language')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('Open Issues')).toBeInTheDocument();
    expect(screen.getByText('Watchers')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
  });

  it('handles error states in both components', async () => {
    // Mock repository list error
    repositoryService.getRepositories.mockRejectedValue(new Error('Network error'));

    renderApp(['/']);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch repositories. Please try again later.')).toBeInTheDocument();
    });
  });

  it('handles repository detail error', async () => {
    // Mock repository detail error
    repositoryService.getRepository.mockRejectedValue(new Error('Repository not found'));

    renderApp(['/repository/999']);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch repository details. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays loading states correctly', () => {
    // Mock pending promises
    repositoryService.getRepositories.mockImplementation(() => new Promise(() => {}));

    renderApp(['/']);

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
  });

  it('complete user journey from list to detail and back', async () => {
    repositoryService.getRepositories.mockResolvedValue(mockRepositories);
    repositoryService.getRepository.mockResolvedValue(mockRepositories[0]);

    const { container } = renderApp(['/']);

    // 1. Start at repository list
    await waitFor(() => {
      expect(screen.getByText('GoDaddy Repositories')).toBeInTheDocument();
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });

    // 2. Navigate to repository detail
    const firstRepoCard = screen.getByText('test-repo-1').closest('.repo-card');
    fireEvent.click(firstRepoCard);

    await waitFor(() => {
      expect(screen.getByText('← Back to Repositories')).toBeInTheDocument();
      expect(screen.getByText('View on GitHub →')).toBeInTheDocument();
    });

    // 3. Verify repository details are displayed
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.getByText('Test repository 1')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // 4. Navigate back to list
    const backButton = screen.getByText('← Back to Repositories');
    fireEvent.click(backButton);

    // Should be back at the list
    await waitFor(() => {
      expect(screen.getByText('GoDaddy Repositories')).toBeInTheDocument();
    });
  });
});
