import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const search = async (query, filters = {}) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: {
            q: query,
            filters: JSON.stringify(filters)
        }
    });
    return response.data;
};

export const suggest = async (query) => {
    const response = await axios.get(`${API_URL}/suggest`, { params: { q: query } });
    return response.data;
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
