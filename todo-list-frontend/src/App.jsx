import { useState, useEffect } from "react";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./services/todoService";
import { CheckIcon, TrashIcon, CalendarIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch {
      toast.error("Failed to load todos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return toast.error("Enter a task");

    const optimistic = {
      id: "temp-" + Date.now(),
      title: newTodo,
      priority: newPriority,
      due_date: newDueDate,
      is_completed: false,
    };
    setTodos([optimistic, ...todos]);
    setNewTodo("");
    setNewPriority("Medium");
    setNewDueDate("");

    try {
      const saved = await createTodo({
        title: optimistic.title,
        priority: optimistic.priority,
        due_date: optimistic.due_date,
      });
      setTodos((prev) =>
        prev.map((t) => (t.id === optimistic.id ? saved : t))
      );
      toast.success("Task added!");
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
      toast.error("Failed to add.");
    }
  };

  const handleToggle = async (todo) => {
    const updated = { ...todo, is_completed: !todo.is_completed };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));

    try {
      await updateTodo(todo.id, { is_completed: updated.is_completed });
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async (id) => {
    const original = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodo(id);
      toast.success("Deleted!");
    } catch {
      setTodos(original);
      toast.error("Failed to delete.");
    }
  };

  const isOverdue = (todo) =>
    todo.due_date && !todo.is_completed && new Date(todo.due_date) < new Date();

  return (
    <div className="app-container">
      <Toaster position="bottom-right" />

      <div className="card">
        <h1 className="title">Todo List</h1>

        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟠 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        <ul className="todo-list">
          {loading ? (
            <li className="empty">Loading...</li>
          ) : todos.length === 0 ? (
            <li className="empty">No tasks yet</li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.is_completed ? "completed" : ""}`}
              >
                <div className="todo-left" onClick={() => handleToggle(todo)}>
                  {todo.is_completed && <CheckIcon className="icon" />}
                  <span className="todo-text">{todo.title}</span>
                  {todo.due_date && (
                    <span className="due-date">
                      ({new Date(todo.due_date).toLocaleDateString()})
                    </span>
                  )}       
                  
                  <span
                    className={`priority-pill ${todo.priority.toLowerCase()}`}
                  >
                    {todo.priority}
                  </span>
                  {isOverdue(todo) && (
                    <span className="overdue-pill">OVERDUE</span>
                  )}
                  {todo.due_date && <CalendarIcon className="calendar-icon" />}
                </div>
                <div className="actions">
                  <button onClick={() => handleToggle(todo)} title="Toggle">
                    <CheckIcon className="icon" />
                  </button>
                  <button onClick={() => handleDelete(todo.id)} title="Delete">
                    <TrashIcon className="icon" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
