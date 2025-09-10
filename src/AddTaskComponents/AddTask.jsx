import React, { useState, useEffect } from "react";
import "./AddTask.css";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

const Tasks = ({ categories }) => {
  const getStoredCategories = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("taskflowCategories") || "[]");
      if (Array.isArray(stored) && stored.length) return stored;
    } catch {}
    return Array.isArray(categories) && categories.length ? categories : ["General"];
  };
  const initialCatList = getStoredCategories();
  const [tasks, setTasks] = useState([
    {
      id: uid(),
      title: "Finish the report",
      description: "complete the quarterly sales report",
      category: "Work",
      completed: false,
      everCompleted: false,
      edited: false,
    },
       {
      id: uid(),
      title: "Study for exam",
      description: "Review flashcards and notes",
      category: "Study",
      completed: false,
      everCompleted: false,
      edited: false,
    },
         {
      id: uid(),
      title: "Buy groceries",
      description: "Milk, Bread, Eggs, and Fruits",
      category: "Personal",
      completed: false,
      everCompleted: false,
      edited: false,
    },
  ]);
  const [categoriesList, setCategoriesList] = useState(initialCatList);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCatList[0] || "General");
  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      return localStorage.getItem("taskflowSelectedCategory") || "All";
    } catch {
      return "All";
    }
  });
  const [editingId, setEditingId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");

  // Keep selected category in sync with Sidebar
  useEffect(() => {
    const update = (e) => setSelectedCategory(e.detail || "All");
    try {
      window.addEventListener("taskflow:categoryChange", update);
    } catch {}
    return () => {
      try { window.removeEventListener("taskflow:categoryChange", update); } catch {}
    };
  }, []);

  // Refresh category list from Sidebar (localStorage) when opening the form
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("taskflowCategories") || "[]");
      if (Array.isArray(stored) && stored.length) {
        setCategoriesList(stored);
      }
    } catch {}
  }, [showForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      setTasks(tasks.map((t) =>
        t.id === editingId ? {
          ...t,
          title,
          description,
          category,
          edited: t.edited || (t.everCompleted && !t.completed)
        } : t
      ));
      setEditingId(null);
    } else {
      const newTask = {
        id: uid(),
        title,
        description,
        category: category || "General",
        completed: false,
        everCompleted: false,
        edited: false,
      };
      setTasks([...tasks, newTask]);
    }

    setTitle("");
    setDescription("");
    setCategory(effectiveDefaultCategory);
    setShowForm(false);
  };

  const handleToggleComplete = (id) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task;
        const nowCompleted = !task.completed;
        return {
          ...task,
          completed: nowCompleted,
          everCompleted: nowCompleted ? true : task.everCompleted,
        };
      })
    );
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEdit = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      if (taskToEdit.completed) {
        setErrorModalMsg("your task has been complete you want edit your task plz uncheck your task");
        setShowErrorModal(true);
        return;
      }
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // First filter by sidebar category selection
    const categoryMatch = selectedCategory === "All" || task.category === selectedCategory;
    if (!categoryMatch) return false;

    // Then apply status filter
    if (filter === "completed") return task.completed;
    if (filter === "uncompleted") return !task.completed;
    return true;
  });

  // Ensure the categories dropdown excludes "All"
  const dropdownCategories = categoriesList.filter((c) => c !== "All");
  const effectiveDefaultCategory = dropdownCategories[0] || "General";

  return (
    <div className="tasks-container">
      {showForm && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowForm(false); setEditingId(null); }
          }}
        >
          <div className="modal-panel">
            <div style={{ marginBottom: 12 }}>
              <h3 className="modal-title">{editingId ? "Edit task" : "Add new task"}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="task-title" className="modal-label">Title</label>
              <input
                id="task-title"
                type="text"
                className="modal-input"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label htmlFor="task-desc" className="modal-label">Description</label>
              <textarea
                id="task-desc"
                className="modal-input"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label htmlFor="task-category" className="modal-label">Category</label>
              <select
                id="task-category"
                className="modal-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {dropdownCategories.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setShowErrorModal(false); setErrorModalMsg(""); } }}>
          <div className="modal-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Action not allowed</h3>
              <button aria-label="Close" onClick={() => { setShowErrorModal(false); setErrorModalMsg(""); }} style={{ background: 'transparent', border: 'none', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ margin: 0 }}>{errorModalMsg}</p>
          </div>
        </div>
      )}

      <div className="tasklist-container">
        <div className="tasklist-header">
          <h2 className="tasklist-title">Tasks</h2>
          <button className="add-task-btn" onClick={() => setShowForm(true)}>
            + Add Task
          </button>
        </div>

        <div className="filter-container">
          <label htmlFor="filter">Filter by:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="uncompleted">Uncompleted</option>
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="no-task">No tasks available. Add one!</p>
        ) : (
          <ul className="tasklist">
            {filteredTasks.map((task) => (
              <li key={task.id} className="task-item">
                <label className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span className="custom-checkbox" aria-hidden="true"></span>
                  <span
                    className={`task-title ${task.completed ? "completed" : ""}`}
                  >
                    {task.title}
                  </span>
                </label>

                <p className="task-desc">{task.description}</p>
                <p className="task-category">Category: {task.category}</p>
                {task.edited && (
                  <p className="task-edited"><span role="img" aria-label="attention">⚠️</span> edited after complete a task</p>
                )}

                <div className="task-actions">
                  <button className="edit-btn" onClick={() => handleEdit(task.id)}>
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(task.id)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tasks;