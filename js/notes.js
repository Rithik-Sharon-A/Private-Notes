import { supabase } from './supabase.js';

let editingNoteId = null;
let autosaveTimer = null;

function scheduleAutosave() {
  if (!editingNoteId) return;

  if (autosaveTimer) clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(async () => {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');

    const title = (titleInput?.value || '').trim();
    const content = (contentInput?.value || '').trim();

    if (!title && !content) return;

    const success = await updateNote(editingNoteId, title, content);
    if (success) {
      loadNotes();
    }
  }, 700);
}

async function loadNotes() {
  const notesList = document.getElementById('notesList');
  if (!notesList) return;

  notesList.innerHTML = '';

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    notesList.textContent = 'Failed to load notes.';
    console.error('Error loading notes', error);
    return;
  }

  if (!data || data.length === 0) {
    notesList.textContent = 'No notes yet';
    return;
  }

  data.forEach((note) => {
    const item = document.createElement('article');

    const title = document.createElement('h3');
    title.textContent = note.title || 'Untitled';

    const content = document.createElement('p');
    content.textContent = note.content || '';

    const timestamp = document.createElement('small');
    const createdAt = note.created_at
      ? new Date(note.created_at).toLocaleString()
      : '';
    timestamp.textContent = createdAt;

    const buttonContainer = document.createElement('div');

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      if (!note.id) return;
      const titleInput = document.getElementById('title');
      const contentInput = document.getElementById('content');
      const saveBtn = document.getElementById('saveBtn');
      
      editingNoteId = note.id;
      if (titleInput) {
        titleInput.value = note.title || '';
      }
      if (contentInput) {
        contentInput.value = note.content || '';
      }
      if (saveBtn) {
        saveBtn.textContent = 'Update';
      }
      if (titleInput) {
        titleInput.focus();
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      if (!note.id) return;
      deleteNote(note.id);
    });

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    item.appendChild(title);
    item.appendChild(content);
    item.appendChild(timestamp);
    item.appendChild(buttonContainer);

    notesList.appendChild(item);
  });
}

async function deleteNote(noteId) {
  if (!noteId) return;

  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) {
    console.error('Error deleting note', error);
    return;
  }

  loadNotes();
}

async function updateNote(noteId, title, content) {
  if (!noteId) return;

  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', noteId);
  if (error) {
    console.error('Error updating note', error);
    return;
  }

  return true;
}

async function saveNote(userId, form) {
  const formData = new FormData(form);
  const title = (formData.get('title') || '').toString().trim();
  const content = (formData.get('content') || '').toString().trim();

  if (!title && !content) return;

  if (editingNoteId) {
    const success = await updateNote(editingNoteId, title, content);
    if (success) {
      editingNoteId = null;
      if (typeof form.reset === 'function') {
        form.reset();
      }
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) {
        saveBtn.textContent = 'Save';
      }
      loadNotes();
    }
    return;
  }

  const { error } = await supabase
    .from('notes')
    .insert([{ title, content, user_id: userId }]);
  if (error) {
    console.error('Error saving note', error);
    return;
  }

  if (typeof form.reset === 'function') {
    form.reset();
  }

  loadNotes();
}

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out', error);
    return;
  }
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const saveBtn = document.getElementById('saveBtn');
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  let currentUser = null;
  let initialized = false;

  function initializeUI(user) {
    if (initialized) return;
    initialized = true;
    currentUser = user;

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.textContent = `User ID: ${user.id}\nEmail: ${user.email || 'N/A'}`;
    }

    loadNotes();

    if (titleInput) {
      titleInput.addEventListener('input', scheduleAutosave);
    }
    if (contentInput) {
      contentInput.addEventListener('input', scheduleAutosave);
    }

    if (noteForm) {
      noteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (currentUser) {
          await saveNote(currentUser.id, noteForm);
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }

  }

  supabase.auth.onAuthStateChange((event, session) => {
    // Handle both initial page load and OAuth redirects
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
      if (!session || !session.user) {
        window.location.href = 'index.html';
        return;
      }
      initializeUI(session.user);
    }
  });
});
