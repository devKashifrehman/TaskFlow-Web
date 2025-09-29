import React, { useMemo, useState, useEffect } from "react";
import "./Sidebar.css";

// Default categories with colors (Work: yellow, Study: blue, Personal: pink)
const DEFAULT_CATEGORIES = [
  { name: "All", color: "Green" },
  { name: "Work", color: "#FACC15" }, // yellow-400
  { name: "Study", color: "#60A5FA" }, // blue-400
  { name: "Personal", color: "#F472B6" }, // pink-400
];

// Generate a pleasant color from a string (for newly added categories)
function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 55%)`;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile drawer state
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Initialize selected category from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("taskflowSelectedCategory");
      if (stored) setSelectedCategory(stored);
      else localStorage.setItem("taskflowSelectedCategory", "All");
    } catch {}
  }, []);

  // Persist category list for other components (e.g., AddTask)
  useEffect(() => {
    try {
      const names = categories.map((c) => c.name);
      localStorage.setItem("taskflowCategories", JSON.stringify(names));
    } catch (e) {
      // ignore storage errors (private mode, etc.)
    }
  }, [categories]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");

  const categoryNames = useMemo(
    () => categories.map((c) => c.name.toLowerCase()),
    [categories]
  );

  const openAddCategoryModal = () => {
    setNewCategoryName("");
    setError("");
    setShowModal(true);
  };

  const closeAddCategoryModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleSaveCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    if (categoryNames.includes(name.toLowerCase())) {
      setError("Category already exists.");
      return;
    }

    const color = colorFromString(name);
    setCategories((prev) => [...prev, { name, color }]);
    setShowModal(false);
    setNewCategoryName("");
    setError("");
  };

  const handleSelect = (name) => {
    setSelectedCategory(name);
    try {
      localStorage.setItem("taskflowSelectedCategory", name);
    } catch {}
    try {
      window.dispatchEvent(
        new CustomEvent("taskflow:categoryChange", { detail: name })
      );
    } catch {}
    // On small screens, close drawer after selecting
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">TaskFlow</h2>
        </div>

        <ul className="sidebar-list">
          {categories.map((category) => (
            <li
              key={category.name}
              className={`sidebar-item ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => handleSelect(category.name)}
            >
              <span
                className="badge-dot"
                style={{ "--dot-color": category.color }}
              />
              <span className="category-label">{category.name}</span>
            </li>
          ))}
        </ul>

        <button className="add-category-btn" onClick={openAddCategoryModal}>
          + Add new category
        </button>

        {/* ---- Footer at Bottom ---- */}
        <div className="sidebar-footer">
          <hr className="neon-line" />
          <p className="copyright-text">
            © {new Date().getFullYear()} Developed by Kashif Rehman
          </p>
        </div>
      </aside>

      {/* Add Category Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addCategoryTitle"
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddCategoryModal();
          }}
        >
          <div className="modal-panel">
            <div style={{ marginBottom: 12 }}>
              <h3 id="addCategoryTitle" className="modal-title">
                Add new category
              </h3>
            </div>

            <label htmlFor="newCategoryName" className="modal-label">
              Name
            </label>
            <input
              id="newCategoryName"
              type="text"
              className="modal-input"
              autoFocus
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCategory();
                if (e.key === "Escape") closeAddCategoryModal();
              }}
              placeholder="Enter category name"
            />
            {error ? <div className="modal-error">{error}</div> : null}

            <div className="modal-actions">
              <button
                onClick={closeAddCategoryModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={handleSaveCategory} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
