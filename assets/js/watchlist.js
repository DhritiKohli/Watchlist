/**
 * Client-side handlers for the Watchlist page.
 * - registers handlers on DOMContentLoaded
 * - provides a simple `submitButton` flow
 * - supports add modal and edit modal (single shared edit modal)
 * - keeps code defensive (null checks) and commented for clarity
 */

document.addEventListener('DOMContentLoaded', () => {
  // Helper: create a new entry on the server. Sends several fields
  // to be compatible with different server implementations.
  async function sendEntry(entry) {
    try {
      const res = await fetch('/createEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      return res.ok;
    } catch (err) {
      console.error('sendEntry network error', err);
      return false;
    }
  }

  // Helper: update an existing entry by id
  async function updateEntry(id, update) {
    try {
      const res = await fetch(`/entry/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      return res.ok;
    } catch (err) {
      console.error('updateEntry network error', err);
      return false;
    }
  }

  // --- Simple submitButton flow (keeps your preferred format) ---
  const submitButton = document.querySelector('input.submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      const date = document.querySelector('input.date')?.value || new Date().toISOString().split('T')[0];
      const dramaName = document.querySelector('input.dramaName').value;
      const comments = document.querySelector('textarea.comments').value;
      const where = document.querySelector('input.whereToWatch').value;
      const viewed = false;
      const dramaId = document.querySelector('input.dramaId')?.value || null;

      // Construct payload compatible with both schema variants
      const payload = {
        date,
        title: dramaName,
        watchlist: dramaName,
        content: comments + (where ? '\nWhere to watch: ' + where : ''),
        email: 'anonymous@example.com',
        viewed,
        dramaId,
      };

      const ok = await sendEntry(payload);
      if (ok) {
        window.location = '/';
      } else {
        console.error('error creating entry');
        addEntryToDOM(dramaName, comments, where, dramaId);
      }
    });
  }

  // --- Add modal behavior (reuse sendEntry) ---
  const addBtn = document.getElementById('addDramaBtn');
  const addModal = document.getElementById('addDramaModal');
  const addForm = document.getElementById('addDramaForm');
  const addCancel = document.getElementById('modalCancel');

  if (addBtn && addModal && addForm) {
    addBtn.addEventListener('click', () => {
      addModal.style.display = 'block';
      document.getElementById('dramaName')?.focus();
    });

    addCancel && addCancel.addEventListener('click', () => {
      addForm.reset();
      addModal.style.display = 'none';
    });

    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dramaName = document.getElementById('dramaName').value.trim();
      const comments = document.getElementById('comments').value.trim();
      const where = document.getElementById('whereToWatch').value.trim();
      if (!dramaName) return;

      const date = new Date().toISOString().split('T')[0];
      const viewed = false;

      const payload = {
        date,
        title: dramaName,
        watchlist: dramaName,
        content: comments + (where ? '\nWhere to watch: ' + where : ''),
        email: 'anonymous@example.com',
        viewed,
      };

      const ok = await sendEntry(payload);
      if (ok) {
        addModal.style.display = 'none';
        window.location.reload();
      } else {
        console.error('server error when creating entry');
        addEntryToDOM(dramaName, comments, where, null);
        addModal.style.display = 'none';
      }
    });
  }

  // --- Edit button handling: open shared edit modal and populate fields ---
  const editModal = document.getElementById('editDramaModal');
  const editForm = document.getElementById('editDramaForm');
  const editCancel = document.getElementById('editModalCancel');

  // delegate clicks on edit buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const row = document.querySelector(`.entry[data-id="${id}"]`);
    if (!row) return;

    // populate edit form fields from the row
    document.getElementById('editDramaId').value = id;
    document.getElementById('editDramaName').value = row.querySelector('.entryWatchlist')?.textContent || '';
    document.getElementById('editComments').value = row.querySelector('.entryContent')?.textContent || '';
    document.getElementById('editWhereToWatch').value = row.querySelector('.entryWhere')?.textContent || '';

    // show modal
    editModal.style.display = 'block';
  });

  // cancel edit
  editCancel && editCancel.addEventListener('click', () => {
    editForm.reset();
    editModal.style.display = 'none';
  });

  // submit edit form
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dramaId = document.getElementById('editDramaId').value;
      const dramaName = document.getElementById('editDramaName').value.trim();
      const comments = document.getElementById('editComments').value.trim();
      const where = document.getElementById('editWhereToWatch').value.trim();
      const date = new Date().toISOString().split('T')[0];
      const viewed = false;

      const update = {
        date,
        title: dramaName,
        watchlist: dramaName,
        content: comments + (where ? '\nWhere to watch: ' + where : ''),
        viewed,
      };

      const ok = await updateEntry(dramaId, update);
      if (ok) {
        editModal.style.display = 'none';
        window.location.reload();
      } else {
        console.error('Error updating entry');
      }
    });
  }

  // Safely append a new entry to the DOM using textContent (no innerHTML)
  function addEntryToDOM(name, comments, where, dramaId) {
    const container = document.querySelector('.entries') || document.querySelector('.indexTopBar');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'entry';
    if (dramaId) div.setAttribute('data-id', dramaId);

    const title = document.createElement('div');
    title.className = 'entryWatchlist';
    title.textContent = name;

    const contentEl = document.createElement('div');
    contentEl.className = 'entryContent';
    contentEl.textContent = comments;

    const whereEl = document.createElement('div');
    whereEl.className = 'entryWhere';
    whereEl.textContent = where || '';

    const actions = document.createElement('div');
    actions.className = 'entryActions';
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    if (dramaId) editBtn.dataset.id = dramaId;
    editBtn.textContent = 'Edit';
    actions.appendChild(editBtn);

    div.appendChild(title);
    div.appendChild(contentEl);
    div.appendChild(whereEl);
    div.appendChild(actions);
    container.appendChild(div);
  }
});
