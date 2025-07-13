import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the components to isolate App component testing
jest.mock('../components/RepositoryList', () => {
  return function MockRepositoryList() {
    return <div data-testid="repository-list">Repository List Component</div>;
  };
});

jest.mock('../components/RepositoryDetail', () => {
  return function MockRepositoryDetail() {
    return <div data-testid="repository-detail">Repository Detail Component</div>;
  };
});

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  it('renders RepositoryList component on root path', () => {
    renderWithRouter(['/']);
    
    expect(screen.getByTestId('repository-list')).toBeInTheDocument();
    expect(screen.queryByTestId('repository-detail')).not.toBeInTheDocument();
  });

  it('renders RepositoryDetail component on repository detail path', () => {
    renderWithRouter(['/repository/1']);
    
    expect(screen.getByTestId('repository-detail')).toBeInTheDocument();
    expect(screen.queryByTestId('repository-list')).not.toBeInTheDocument();
  });

  it('renders RepositoryList component on unknown path (fallback)', () => {
    renderWithRouter(['/unknown-path']);
    
    expect(screen.getByTestId('repository-list')).toBeInTheDocument();
    expect(screen.queryByTestId('repository-detail')).not.toBeInTheDocument();
  });

  it('has proper routing structure', () => {
    renderWithRouter(['/']);
    
    // Check that the App component renders without crashing
    expect(screen.getByTestId('repository-list')).toBeInTheDocument();
  });
});
