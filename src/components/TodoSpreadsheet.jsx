import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = '/api/tasks';

export default function TodoSpreadsheet() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task: '', status: 'Not Started', priority: 'Medium', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.task.trim()) {
      try {
        const response = await axios.post(API_URL, newTask);
        setTasks([...tasks, response.data]);
        setNewTask({ task: '', status: 'Not Started', priority: 'Medium', dueDate: '' });
        setError(null);
      } catch (err) {
        console.error('Error adding task:', err);
        setError('Failed to add task');
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const updateTask = async (id, field, value) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    const updatedTask = { ...taskToUpdate, [field]: value };

    try {
      await axios.put(`${API_URL}/${id}`, updatedTask);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <h1 className="text-3xl font-bold text-white">To-Do List</h1>
            <p className="text-green-100 mt-1">Organize your tasks efficiently with DynamoDB</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Spreadsheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-40">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-40">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={task.task}
                        onChange={(e) => updateTask(task.id, 'task', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                        className={`w-full px-2 py-1 rounded font-medium text-sm ${getStatusColor(task.status)} border-0 focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                        className={`w-full px-2 py-1 rounded font-medium text-sm ${getPriorityColor(task.priority)} border-0 focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add New Task Row */}
                <tr className="bg-green-50 border-t-2 border-green-200">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <Plus size={18} className="text-green-600" />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="Enter new task..."
                      value={newTask.task}
                      onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                      className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={addTask}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Tasks: <span className="font-semibold">{tasks.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Completed: <span className="font-semibold text-green-600">
                {tasks.filter(t => t.status === 'Completed').length}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              In Progress: <span className="font-semibold text-blue-600">
                {tasks.filter(t => t.status === 'In Progress').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
