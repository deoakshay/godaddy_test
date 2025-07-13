import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export const repositoryService = {
  getAllRepositories: async () => {
    const response = await axios.get(`${BASE_URL}/repositories`);
    return response.data;
  },

  getRepository: async (id) => {
    const response = await axios.get(`${BASE_URL}/repositories/${id}`);
    return response.data;
  }
};
