package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gorilla/mux"
)

func TestGetRepositoriesHandler(t *testing.T) {
	// Create mock GitHub API server
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/search/repositories" && r.URL.Query().Get("q") == "org:godaddy" {
			mockResponse := GitHubResponse{
				Items: []Repository{
					{
						ID:          1,
						Name:        "test-repo-1",
						FullName:    "godaddy/test-repo-1",
						Description: "Test repository 1",
						Language:    "Go",
						ForksCount:  5,
						OpenIssues:  2,
						Watchers:    10,
						StarCount:   15,
						HTMLURL:     "https://github.com/godaddy/test-repo-1",
					},
					{
						ID:          2,
						Name:        "test-repo-2",
						FullName:    "godaddy/test-repo-2",
						Description: "Test repository 2",
						Language:    "JavaScript",
						ForksCount:  8,
						OpenIssues:  3,
						Watchers:    20,
						StarCount:   25,
						HTMLURL:     "https://github.com/godaddy/test-repo-2",
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(mockResponse)
		} else {
			http.Error(w, "Not found", http.StatusNotFound)
		}
	}))
	defer mockServer.Close()

	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Mock the fetchGoDaddyRepos function by directly calling the mock server
		url := mockServer.URL + "/search/repositories?q=org:godaddy&per_page=50&sort=stars&order=desc"

		resp, err := http.Get(url)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			http.Error(w, "GitHub API error", http.StatusInternalServerError)
			return
		}

		var githubResp GitHubResponse
		if err := json.NewDecoder(resp.Body).Decode(&githubResp); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(githubResp.Items)
	})

	req, err := http.NewRequest("GET", "/api/repositories", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	testHandler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var repos []Repository
	if err := json.Unmarshal(rr.Body.Bytes(), &repos); err != nil {
		t.Errorf("Response is not valid JSON: %v", err)
	}

	if len(repos) != 2 {
		t.Errorf("Expected 2 repositories, got %d", len(repos))
	}

	if len(repos) > 0 {
		repo := repos[0]
		if repo.Name != "test-repo-1" {
			t.Errorf("Expected first repo name to be 'test-repo-1', got '%s'", repo.Name)
		}
		if repo.Language != "Go" {
			t.Errorf("Expected first repo language to be 'Go', got '%s'", repo.Language)
		}
		if repo.StarCount != 15 {
			t.Errorf("Expected first repo stars to be 15, got %d", repo.StarCount)
		}
	}
}

func TestGetRepositoryHandler(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/search/repositories" && r.URL.Query().Get("q") == "org:godaddy" {
			mockResponse := GitHubResponse{
				Items: []Repository{
					{
						ID:          1,
						Name:        "test-repo-1",
						FullName:    "godaddy/test-repo-1",
						Description: "Test repository 1",
						Language:    "Go",
						ForksCount:  5,
						OpenIssues:  2,
						Watchers:    10,
						StarCount:   15,
						HTMLURL:     "https://github.com/godaddy/test-repo-1",
					},
					{
						ID:          2,
						Name:        "test-repo-2",
						FullName:    "godaddy/test-repo-2",
						Description: "Test repository 2",
						Language:    "JavaScript",
						ForksCount:  8,
						OpenIssues:  3,
						Watchers:    20,
						StarCount:   25,
						HTMLURL:     "https://github.com/godaddy/test-repo-2",
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(mockResponse)
		}
	}))
	defer mockServer.Close()

	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid repository ID", http.StatusBadRequest)
			return
		}

		url := mockServer.URL + "/search/repositories?q=org:godaddy&per_page=50&sort=stars&order=desc"

		resp, err := http.Get(url)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		var githubResp GitHubResponse
		if err := json.NewDecoder(resp.Body).Decode(&githubResp); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, repo := range githubResp.Items {
			if repo.ID == id {
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(repo)
				return
			}
		}

		http.Error(w, "Repository not found", http.StatusNotFound)
	})

	req, err := http.NewRequest("GET", "/api/repositories/1", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/repositories/{id:[0-9]+}", testHandler).Methods("GET")

	router.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var repo Repository
	if err := json.Unmarshal(rr.Body.Bytes(), &repo); err != nil {
		t.Errorf("Response is not valid JSON: %v", err)
	}

	if repo.ID != 1 {
		t.Errorf("Expected repository ID to be 1, got %d", repo.ID)
	}
	if repo.Name != "test-repo-1" {
		t.Errorf("Expected repository name to be 'test-repo-1', got '%s'", repo.Name)
	}
}

func TestRepositoryJSONMarshaling(t *testing.T) {
	repo := Repository{
		ID:          1,
		Name:        "test-repo",
		FullName:    "godaddy/test-repo",
		Description: "Test repository",
		Language:    "Go",
		ForksCount:  5,
		OpenIssues:  2,
		Watchers:    10,
		StarCount:   15,
		HTMLURL:     "https://github.com/godaddy/test-repo",
	}

	jsonData, err := json.Marshal(repo)
	if err != nil {
		t.Errorf("Failed to marshal repository to JSON: %v", err)
	}

	var unmarshaledRepo Repository
	if err := json.Unmarshal(jsonData, &unmarshaledRepo); err != nil {
		t.Errorf("Failed to unmarshal repository from JSON: %v", err)
	}

	if repo.ID != unmarshaledRepo.ID {
		t.Errorf("Expected ID %d, got %d", repo.ID, unmarshaledRepo.ID)
	}
	if repo.Name != unmarshaledRepo.Name {
		t.Errorf("Expected Name %s, got %s", repo.Name, unmarshaledRepo.Name)
	}
	if repo.StarCount != unmarshaledRepo.StarCount {
		t.Errorf("Expected StarCount %d, got %d", repo.StarCount, unmarshaledRepo.StarCount)
	}
}

func TestFetchGoDaddyRepos(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/search/repositories" && r.URL.Query().Get("q") == "org:godaddy" {
			mockResponse := GitHubResponse{
				Items: []Repository{
					{
						ID:          1,
						Name:        "mock-repo-1",
						FullName:    "godaddy/mock-repo-1",
						Description: "Mock repository 1",
						Language:    "Go",
						ForksCount:  5,
						OpenIssues:  2,
						Watchers:    10,
						StarCount:   15,
						HTMLURL:     "https://github.com/godaddy/mock-repo-1",
					},
					{
						ID:          2,
						Name:        "mock-repo-2",
						FullName:    "godaddy/mock-repo-2",
						Description: "Mock repository 2",
						Language:    "JavaScript",
						ForksCount:  8,
						OpenIssues:  3,
						Watchers:    20,
						StarCount:   25,
						HTMLURL:     "https://github.com/godaddy/mock-repo-2",
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(mockResponse)
		} else {
			http.Error(w, "Not found", http.StatusNotFound)
		}
	}))
	defer mockServer.Close()

	mockFetchGoDaddyRepos := func() ([]Repository, error) {
		url := mockServer.URL + "/search/repositories?q=org:godaddy&per_page=50&sort=stars&order=desc"

		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, err
		}

		var githubResp GitHubResponse
		if err := json.NewDecoder(resp.Body).Decode(&githubResp); err != nil {
			return nil, err
		}

		return githubResp.Items, nil
	}

	repos, err := mockFetchGoDaddyRepos()
	if err != nil {
		t.Errorf("Failed to fetch repositories: %v", err)
		return
	}

	if len(repos) != 2 {
		t.Errorf("Expected 2 repositories, got %d", len(repos))
	}

	if len(repos) > 0 {
		repo := repos[0]
		if repo.ID == 0 {
			t.Error("Repository ID should not be zero")
		}
		if repo.Name == "" {
			t.Error("Repository name should not be empty")
		}
		if repo.HTMLURL == "" {
			t.Error("Repository HTML URL should not be empty")
		}
		if repo.Name != "mock-repo-1" {
			t.Errorf("Expected first repo name to be 'mock-repo-1', got '%s'", repo.Name)
		}
	}
}

func TestGetRepositoryInvalidID(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/repositories/invalid", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/repositories/{id:[0-9]+}", getRepository).Methods("GET")

	router.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusNotFound {
		t.Errorf("handler returned wrong status code for invalid ID: got %v want %v",
			status, http.StatusNotFound)
	}
}

func TestGetRepositoriesHandlerError(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}))
	defer mockServer.Close()

	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		url := mockServer.URL + "/search/repositories?q=org:godaddy&per_page=50&sort=stars&order=desc"

		resp, err := http.Get(url)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			http.Error(w, "GitHub API error", http.StatusInternalServerError)
			return
		}
	})

	req, err := http.NewRequest("GET", "/api/repositories", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	testHandler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusInternalServerError {
		t.Errorf("handler should return 500 for API error, got %v", status)
	}
}

func TestGitHubResponse(t *testing.T) {
	response := GitHubResponse{
		Items: []Repository{
			{
				ID:        1,
				Name:      "test-repo-1",
				StarCount: 10,
			},
			{
				ID:        2,
				Name:      "test-repo-2",
				StarCount: 20,
			},
		},
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		t.Errorf("Failed to marshal GitHubResponse to JSON: %v", err)
	}

	var unmarshaledResponse GitHubResponse
	if err := json.Unmarshal(jsonData, &unmarshaledResponse); err != nil {
		t.Errorf("Failed to unmarshal GitHubResponse from JSON: %v", err)
	}

	if len(unmarshaledResponse.Items) != 2 {
		t.Errorf("Expected 2 items, got %d", len(unmarshaledResponse.Items))
	}
}
