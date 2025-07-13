package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Repository struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	HTMLURL     string `json:"html_url"`
	Language    string `json:"language"`
	ForksCount  int    `json:"forks_count"`
	OpenIssues  int    `json:"open_issues_count"`
	Watchers    int    `json:"watchers_count"`
	StarCount   int    `json:"stargazers_count"`
}

type GitHubResponse struct {
	Items []Repository `json:"items"`
}

func fetchGoDaddyRepos() ([]Repository, error) {
	url := "https://api.github.com/search/repositories?q=org:godaddy&per_page=50&sort=stars&order=desc"

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("error fetching repositories: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status code: %d", resp.StatusCode)
	}

	var githubResp GitHubResponse
	if err := json.NewDecoder(resp.Body).Decode(&githubResp); err != nil {
		return nil, fmt.Errorf("error decoding response: %v", err)
	}

	return githubResp.Items, nil
}

func getRepositories(w http.ResponseWriter, r *http.Request) {
	repos, err := fetchGoDaddyRepos()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(repos)
}

func getRepository(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid repository ID", http.StatusBadRequest)
		return
	}

	repos, err := fetchGoDaddyRepos()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, repo := range repos {
		if repo.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(repo)
			return
		}
	}

	http.Error(w, "Repository not found", http.StatusNotFound)
}

func main() {
	r := mux.NewRouter()

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/repositories", getRepositories).Methods("GET")
	api.HandleFunc("/repositories/{id:[0-9]+}", getRepository).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
