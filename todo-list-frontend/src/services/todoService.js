import axios from 'axios';

const API_URL = 'http://localhost:3000';
const todoApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTodos = async (filter, sort) => {
  try {
    const response = await todoApi.get('/todos', {
      params: { filter, sort }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch todos';
  }
};

export const createTodo = async (todoData) => {
  try {
    const response = await todoApi.post('/todos', todoData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create todo';
  }
};

export const updateTodo = async (id, todoData) => {
  try {
    const response = await todoApi.put(`/todos/${id}`, todoData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update todo';
  }
};

export const deleteTodo = async (id) => {
  try {
    await todoApi.delete(`/todos/${id}`);
    return true;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete todo';
  }
};
