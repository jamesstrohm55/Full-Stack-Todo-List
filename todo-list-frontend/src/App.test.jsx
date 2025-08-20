import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import * as todoService from './services/todoService';

jest.mock('./services/todoService');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Verifies fetching and rendering todos on mount
  test('renders the app and fetches todos on mount', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', is_completed: false, priority: 'High', due_date: '2025-08-19' },
    ];
    todoService.getTodos.mockResolvedValue(mockTodos);

    await act(async () => {
      render(<App />);
    });

    const todoElement = await screen.findByText('Test Todo 1');
    expect(todoElement).toBeInTheDocument();
  });

  // Test 2: Allows a user to add a new todo
  test('allows a user to add a new todo', async () => {
    todoService.getTodos.mockResolvedValue([]);
    
    const newTodoTitle = "New Task to Add";
    todoService.createTodo.mockResolvedValue({
      id: 3,
      title: newTodoTitle,
      is_completed: false,
      priority: 'Medium',
      due_date: '',
    });

    await act(async () => {
      render(<App />);
    });

    const noTasksMessage = await screen.findByText(/No tasks yet/i);
    expect(noTasksMessage).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    const addButton = screen.getByRole('button', { name: /Add/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: newTodoTitle } });
      fireEvent.click(addButton);
    });

    const newTodoElement = await screen.findByText(newTodoTitle);
    expect(newTodoElement).toBeInTheDocument();

    await waitFor(() => {
      expect(todoService.createTodo).toHaveBeenCalledWith({
        title: newTodoTitle,
        priority: 'Medium',
        due_date: '',
      });
    });
  });

  // Test 3: Allows a user to add a new todo with custom priority and date
  test('allows a user to add a new todo with custom priority and date', async () => {
    todoService.getTodos.mockResolvedValue([]);
    
    const newTodoTitle = "New Task with Custom Settings";
    todoService.createTodo.mockResolvedValue({
      id: 4,
      title: newTodoTitle,
      is_completed: false,
      priority: 'High',
      due_date: '2025-08-25',
    });

    await act(async () => {
      render(<App />);
    });

    await screen.findByText(/No tasks yet/i);

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    const prioritySelect = screen.getByRole('combobox');
    const allInputs = screen.getAllByRole('textbox');
    const dateInput = allInputs.find(input => input.type === 'date') || 
                      document.querySelector('input[type="date"]');
    const addButton = screen.getByRole('button', { name: /Add/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: newTodoTitle } });
      fireEvent.change(prioritySelect, { target: { value: 'High' } });
      fireEvent.change(dateInput, { target: { value: '2025-08-25' } });
      fireEvent.click(addButton);
    });

    const newTodoElement = await screen.findByText(newTodoTitle);
    expect(newTodoElement).toBeInTheDocument();

    await waitFor(() => {
      expect(todoService.createTodo).toHaveBeenCalledWith({
        title: newTodoTitle,
        priority: 'High',
        due_date: '2025-08-25',
      });
    });
  });
});