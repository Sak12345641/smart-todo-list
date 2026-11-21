
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [task, setTask] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  async function loadTasks() {
    try {
      const response = await fetch('https://smart-todo-list-3518.onrender.com/tasks')
      if (!response.ok) throw new Error('Failed to load tasks')

      const data = await response.json()
      setTasks(data.tasks)
      setError('')
    } catch {
      setError('Unable to connect to the backend.')
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!task.trim()) return

    try {
      const response = await fetch('https://smart-todo-list-3518.onrender.com/tasks, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.trim() }),
      })

      if (!response.ok) throw new Error('Failed to save task')

      const newTask = await response.json()
      setTasks(current => [...current, newTask])
      setTask('')
      setError('')
    } catch {
      setError('Failed to save task. Please check the backend.')
    }
  }

  
async function toggleTask(id) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/tasks/${id}`, {
      method: 'PUT',
    })

    if (!response.ok) throw new Error('Failed to update task')

    const updatedTask = await response.json()

    setTasks(current =>
      current.map(item => item.id === id ? updatedTask : item)
    )
  } catch {
    setError('Failed to update task. Please try again.')
  }
}


  
async function deleteTask(id) {
  try {
    const response = await fetch(`https://smart-todo-list-3518.onrender.com/tasks${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete task')

    setTasks(current => current.filter(item => item.id !== id))
    setError('')
  } catch {
    setError('Failed to delete task. Please try again.')
  }
}

  const completedCount = tasks.filter(item => item.completed).length
  const pendingCount = tasks.length - completedCount

  const filteredTasks = tasks.filter(item => {
    if (filter === 'pending') return !item.completed
    if (filter === 'completed') return item.completed
    return true
  })

  return (
    <main className="app">
      <section className="todo-card">
        <div className="top-icon">✦</div>

        <header>
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>Smart <span>To-Do List</span></h1>
          <p className="subtitle">Small steps every day lead to big results.</p>
        </header>

        <div className="stats">
          <div className="stat-box">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-box">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="stat-box">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="What do you need to do today?"
          />
          <button className="add-btn" type="submit">+ Add Task</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <nav className="filters">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All Tasks
          </button>
          <button type="button" className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button type="button" className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
            Completed
          </button>
        </nav>

        <section className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <span>☀</span>
              <p>{filter === 'pending' ? 'No pending tasks!' : filter === 'completed' ? 'No completed tasks yet.' : 'Your task list is empty.'}</p>
              <small>Tasks you add will appear here.</small>
            </div>
          ) : (
            filteredTasks.map(item => (
              <article className={`task-item ${item.completed ? 'is-completed' : ''}`} key={item.id}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleTask(item.id)}
                  />
                  <span className="custom-check"></span>
                  <span className="task-title">{item.title}</span>
                </label>

                <button className="delete-btn" type="button" onClick={() => deleteTask(item.id)}>
                  Delete
                </button>
              </article>
            ))
          )}
        </section>

        <footer>Stay focused. You've got this ✨</footer>
      </section>
    </main>
  )
}

export default App
