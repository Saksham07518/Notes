import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const TABS = [
  { id: "all", label: "All Notes", icon: "description" },
  { id: "favorites", label: "Favorites", icon: "star" },
  { id: "recent", label: "Recent", icon: "schedule" },
  { id: "trash", label: "Trash", icon: "delete" },
];

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const saveTimer = useRef(null);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "User";

  const api = useMemo(
    () => axios.create({ baseURL: API_URL, headers: { authorization: token } }),
    [token]
  );

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const activeNote = notes.find((n) => n._id === activeNoteId);

  const selectNote = (note) => {
    setActiveNoteId(note._id);
    setTitle(note.title || "");
    setContent(note.content || "");
  };

  const createNote = async () => {
    try {
      const res = await api.post("/notes/create", {
        title: "Untitled Note",
        content: "",
        isFavorite: currentTab === "favorites",
      });
      const newNote = res.data.note;
      setNotes((prev) => [newNote, ...prev]);
      if (currentTab === "trash") setCurrentTab("all");
      selectNote(newNote);
    } catch (err) {
      console.error("Create note failed", err);
    }
  };

  const patchNote = async (id, data) => {
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...data } : n)));
    try {
      await api.patch(`/notes/${id}`, data);
    } catch (err) {
      console.error("Update failed", err);
      fetchNotes();
    }
  };

  // Debounced auto-save for editor text changes
  const autoSave = (noteId, newTitle, newContent) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await patchNote(noteId, {
        title: newTitle,
        content: newContent,
        updatedAt: new Date().toISOString(),
      });
      setSaving(false);
    }, 600);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (activeNoteId) autoSave(activeNoteId, val, content);
  };

  const handleContentChange = (val) => {
    setContent(val);
    if (activeNoteId) autoSave(activeNoteId, title, val);
  };

  const toggleFavorite = (e, noteId) => {
    e?.stopPropagation();
    const target = notes.find((n) => n._id === noteId);
    if (target) patchNote(noteId, { isFavorite: !target.isFavorite });
  };

  const moveToTrash = (e, noteId) => {
    e?.stopPropagation();
    patchNote(noteId, { isTrash: true });
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setTitle("");
      setContent("");
    }
  };

  const restoreNote = (e, noteId) => {
    e?.stopPropagation();
    patchNote(noteId, { isTrash: false });
  };

  const deletePermanently = async (e, noteId) => {
    e?.stopPropagation();
    if (!window.confirm("Permanently delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setTitle("");
      setContent("");
    }
    try {
      await api.delete(`/notes/${noteId}`);
    } catch {
      fetchNotes();
    }
  };

  const emptyTrash = async () => {
    if (!window.confirm("Permanently delete all notes in trash?")) return;
    setNotes((prev) => prev.filter((n) => !n.isTrash));
    if (activeNote?.isTrash) {
      setActiveNoteId(null);
      setTitle("");
      setContent("");
    }
    try {
      await api.delete("/notes/empty-trash");
    } catch {
      fetchNotes();
    }
  };

  const copyNote = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadNote = () => {
    const blob = new Blob([`${title}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "note").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const diff = new Date() - new Date(dateStr);
    if (diff < 6e4) return "Just now";
    if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
    if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Live counts for sidebar & pills
  const counts = {
    all: notes.filter((n) => !n.isTrash).length,
    favorites: notes.filter((n) => !n.isTrash && n.isFavorite).length,
    recent: notes.filter((n) => !n.isTrash && new Date() - new Date(n.updatedAt || n.createdAt) < 7 * 864e5).length,
    trash: notes.filter((n) => n.isTrash).length,
  };

  const filteredNotes = notes
    .filter((n) => {
      if (currentTab === "trash") return n.isTrash;
      if (n.isTrash) return false;
      if (currentTab === "favorites") return n.isFavorite;
      if (currentTab === "recent") return new Date() - new Date(n.updatedAt || n.createdAt) < 7 * 864e5;
      return true;
    })
    .filter((n) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "created-desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

  const tabLabels = { all: "All Notes", favorites: "Favorites", recent: "Recent Notes", trash: "Trash" };
  const initials = userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className={`notes-layout ${activeNoteId ? "editor-active" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ===== Sidebar Drawer ===== */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="sidebar-logo">
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--primary)" }}>edit_note</span>
            </div>
            <div>
              <div className="font-headline-sm" style={{ color: "var(--primary)", fontStyle: "italic" }}>You Notes</div>
              <div className="font-label-sm" style={{ color: "var(--secondary)", textTransform: "uppercase" }}>Quiet workspace</div>
            </div>
          </div>
          <button type="button" className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sidebar-item ${currentTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setCurrentTab(tab.id);
                setSidebarOpen(false);
              }}
            >
              <span className="material-symbols-outlined" style={{ color: tab.id === "favorites" && currentTab === "favorites" ? "#c98a2c" : "inherit" }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              <span className="sidebar-count">{counts[tab.id]}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="sidebar-avatar">{initials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-username">{userName}</div>
                <div className="sidebar-email-label font-label-sm">Workspace</div>
              </div>
            </div>
            <button
              onClick={() => { localStorage.clear(); navigate("/logged-out"); }}
              title="Sign out"
              style={{ color: "var(--secondary)", padding: 4 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Middle Notes Index ===== */}
      <section className="notes-panel">
        <div className="notes-panel-header">
          <div className="notes-panel-title flex items-center justify-between">
            <div className="flex items-center">
              <button type="button" className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
              </button>
              <div>
                <h2 className="font-headline-sm" style={{ margin: 0 }}>{tabLabels[currentTab]}</h2>
                <span className="font-label-sm" style={{ color: "var(--secondary)" }}>
                  {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
                </span>
              </div>
            </div>

            {currentTab === "trash" ? (
              counts.trash > 0 && (
                <button onClick={emptyTrash} className="btn-secondary" style={{ width: "auto", padding: "0.375rem 0.625rem", color: "var(--error)", fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
                  <span>Empty</span>
                </button>
              )
            ) : (
              <button onClick={createNote} className="btn-primary" style={{ width: "auto", padding: "0.375rem 0.75rem", gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                <span>New</span>
              </button>
            )}
          </div>

          {/* Quick horizontal filter pills for 1-tap switching */}
          <div className="mobile-pills-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mobile-pill ${currentTab === tab.id ? "active" : ""}`}
                onClick={() => setCurrentTab(tab.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: tab.id === "favorites" && currentTab !== "favorites" ? "#c98a2c" : "inherit" }}>
                  {tab.icon}
                </span>
                {tab.label} ({counts[tab.id]})
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex-col gap-2" style={{ marginTop: 8 }}>
            <div className="notes-search">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder={`Search in ${tabLabels[currentTab].toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--secondary)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>

            <div className="flex justify-between items-center font-label-sm" style={{ color: "var(--secondary)" }}>
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ border: "none", background: "transparent", color: "var(--primary)", fontSize: 11, fontWeight: 500, cursor: "pointer", outline: "none" }}
              >
                <option value="updated-desc">Recently Updated</option>
                <option value="created-desc">Date Created</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Note Cards List */}
        <div className="notes-list">
          {loading ? (
            <div className="empty-state"><div className="spinner" style={{ borderColor: "var(--primary-container)", borderTopColor: "transparent" }} /></div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">
                  {currentTab === "trash" ? "delete_outline" : currentTab === "favorites" ? "star_outline" : "note_add"}
                </span>
              </div>
              <p className="font-body-sm" style={{ color: "var(--secondary)" }}>
                {search ? "No matching notes found." : currentTab === "trash" ? "Trash is empty." : "No notes yet. Click '+ New' to create one!"}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`note-item ${activeNoteId === note._id ? "active" : ""}`}
                onClick={() => selectNote(note)}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="note-item-title" style={{ flex: 1, margin: 0 }}>{note.title || "Untitled Note"}</div>
                  {note.isFavorite && !note.isTrash && (
                    <span className="note-star-badge" title="Favorite">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>star</span>
                    </span>
                  )}
                </div>

                <div className="note-item-excerpt" style={{ marginTop: 4 }}>{note.content || "Empty note"}</div>
                <div className="note-item-time">{formatDate(note.updatedAt || note.createdAt)}</div>

                <div className="note-item-actions">
                  {currentTab === "trash" ? (
                    <>
                      <button className="note-action-btn" onClick={(e) => restoreNote(e, note._id)} title="Restore">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>restore</span>
                      </button>
                      <button className="note-action-btn" onClick={(e) => deletePermanently(e, note._id)} title="Delete forever" style={{ color: "var(--error)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete_forever</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={`note-action-btn ${note.isFavorite ? "star-active" : ""}`} onClick={(e) => toggleFavorite(e, note._id)} title="Favorite">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: note.isFavorite ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      </button>
                      <button className="note-action-btn" onClick={(e) => moveToTrash(e, note._id)} title="Move to trash" style={{ color: "var(--error)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===== Editor Canvas ===== */}
      <section className="editor-panel">
        {activeNote ? (
          <>
            {activeNote.isTrash && (
              <div className="trash-banner flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  <span>This note is in trash.</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => restoreNote(null, activeNote._id)}>Restore</button>
                  <button onClick={() => deletePermanently(null, activeNote._id)}>Delete Forever</button>
                </div>
              </div>
            )}

            <div className="editor-header flex justify-between items-center">
              <button onClick={() => { setActiveNoteId(null); setTitle(""); setContent(""); }} className="mobile-back-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                <span>Notes</span>
              </button>

              <div className="editor-status flex items-center gap-2">
                <div className="editor-status-dot" style={{ backgroundColor: saving ? "var(--on-tertiary-container)" : "#34a853" }} />
                <span>{saving ? "Saving..." : "Saved"}</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span className="font-code-sm" style={{ fontSize: 11 }}>{wordCount} words · {content.length} chars</span>
              </div>

              <div className="flex items-center gap-1">
                {!activeNote.isTrash && (
                  <button
                    onClick={() => toggleFavorite(null, activeNote._id)}
                    style={{ padding: 6, color: activeNote.isFavorite ? "#c98a2c" : "var(--secondary)" }}
                    title="Favorite"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: activeNote.isFavorite ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  </button>
                )}
                <button onClick={copyNote} style={{ padding: 6, color: "var(--secondary)" }} title="Copy note">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{copied ? "check" : "content_copy"}</span>
                </button>
                <button onClick={downloadNote} style={{ padding: 6, color: "var(--secondary)" }} title="Export as Markdown">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                </button>
                {activeNote.isTrash ? (
                  <button onClick={() => deletePermanently(null, activeNote._id)} style={{ padding: 6, color: "var(--error)" }} title="Delete permanently">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete_forever</span>
                  </button>
                ) : (
                  <button onClick={() => moveToTrash(null, activeNote._id)} style={{ padding: 6, color: "var(--secondary)" }} title="Move to trash">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                  </button>
                )}
              </div>
            </div>

            <div className="editor-content">
              <div className="editor-inner">
                <input
                  className="editor-title-input"
                  type="text"
                  placeholder="Untitled Note"
                  value={title}
                  disabled={activeNote.isTrash}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
                <textarea
                  className="editor-body-input"
                  placeholder="Start writing your thoughts, ideas, or reflections..."
                  value={content}
                  disabled={activeNote.isTrash}
                  onChange={(e) => handleContentChange(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            </div>
            <h3 className="font-headline-sm" style={{ marginBottom: 4 }}>Select a note</h3>
            <p className="font-body-sm" style={{ color: "var(--secondary)", maxWidth: 280 }}>
              Choose a note from {tabLabels[currentTab].toLowerCase()} or create a new one to begin drafting.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
