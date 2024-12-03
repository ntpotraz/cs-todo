import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Edit, Check, X } from 'lucide-react';
import Confetti from 'react-confetti';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  
  // Easter Egg States
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const clickTimeout = useRef<number | null>(null);


  // Load todos from localStorage on initial render
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) setTodos(JSON.parse(storedTodos));
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id: number, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const saveEditing = (id: number) => {
    if (!editingText.trim()) return;
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: editingText } : todo
    ));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Handle Easter Egg Activation
  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }

    clickTimeout.current = setTimeout(() => {
      setClickCount(0);
    }, 3000); // Reset click count after 3 seconds

    if (clickCount + 1 === 5) {
      activateEasterEgg();
      setClickCount(0);
    }
  };

  const activateEasterEgg = () => {
    setShowEasterEgg(true);
    // Hide Easter egg after 5 seconds
    setTimeout(() => {
      setShowEasterEgg(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-red-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 transition-colors">
        <h1 
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center cursor-pointer select-none"
          onClick={handleTitleClick}
          title="Click me 5 times for a surprise!"
        >
          Todo App
        </h1>
        
        <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Add a new todo..."
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 
                       flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={18} />
            <span className="sm:inline">Add</span>
          </button>
        </form>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {todos.length} {todos.length === 1 ? 'Todo' : 'Todos'}
          </span>
          <div className="flex space-x-2">
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm px-3 py-1 rounded-full 
                           ${filter === f 
                             ? 'bg-blue-500 text-white' 
                             : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                           transition-colors`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {filteredTodos.map(todo => (
            <li 
              key={todo.id} 
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg 
                         border border-gray-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="h-5 w-5 cursor-pointer accent-blue-500"
              />
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm sm:text-base border-b border-blue-500 focus:outline-none bg-transparent text-gray-800"
                />
              ) : (
                <span 
                  className={`flex-1 text-sm sm:text-base break-all
                            ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                >
                  {todo.text}
                </span>
              )}
              {editingId === todo.id ? (
                <>
                  <button
                    onClick={() => saveEditing(todo.id)}
                    className="text-green-500 hover:text-green-600 active:text-green-700 p-1 rounded-full transition-colors"
                    aria-label="Save edit"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-red-500 hover:text-red-600 active:text-red-700 p-1 rounded-full transition-colors"
                    aria-label="Cancel edit"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className="text-gray-400 hover:text-blue-500 active:text-blue-600 p-1 rounded-full transition-colors"
                    aria-label="Edit todo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 active:text-red-600 p-1 rounded-full transition-colors"
                    aria-label="Delete todo"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        
        {todos.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            No todos yet. Add some above!
          </p>
        )}

        {todos.some(todo => todo.completed) && (
          <button
            onClick={clearCompleted}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 active:bg-red-700 
                       flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            <span>Clear Completed</span>
          </button>
        )}

        {/* Easter Egg: Confetti Animation and Message */}
        {showEasterEgg && (
          <>
            <Confetti 
              width={window.innerWidth} 
              height={window.innerHeight} 
              numberOfPieces={300} 
              recycle={false}
              gravity={0.3}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse">
              🎉 Surprise! You've found the Easter Egg! 🎉
            </div>
          </>
        )}
      </div>
    </div>
  );
}
