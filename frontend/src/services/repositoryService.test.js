import { repositoryService } from '../services/repositoryService';

// Mock fetch globally
global.fetch = jest.fn();

describe('repositoryService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRepositories', () => {
    it('should fetch repositories successfully', async () => {
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

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepositories,
      });

      const result = await repositoryService.getRepositories();

      expect(fetch).toHaveBeenCalledWith('/api/repositories');
      expect(result).toEqual(mockRepositories);
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(repositoryService.getRepositories()).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(repositoryService.getRepositories()).rejects.toThrow('Failed to fetch repositories');
    });
  });

  describe('getRepository', () => {
    it('should fetch a single repository successfully', async () => {
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

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepository,
      });

      const result = await repositoryService.getRepository(1);

      expect(fetch).toHaveBeenCalledWith('/api/repositories/1');
      expect(result).toEqual(mockRepository);
    });

    it('should throw error when repository not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(repositoryService.getRepository(999)).rejects.toThrow('Failed to fetch repository');
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(repositoryService.getRepository(1)).rejects.toThrow('Network error');
    });
  });
});
