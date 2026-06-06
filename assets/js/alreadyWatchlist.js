document.addEventListener('DOMContentLoaded', () => {
  // Helper: send entry to server (create). Aligns with server schema fields.
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

  async function updateEntry(id, update) {
    try {
      const res = await fetch(`/entry/${id}`, {
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

  // Optional direct submit button flow (keeps existing UX if present)
  const submitButton = document.querySelector('input.submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      const date = document.querySelector('input.date')?.value || new Date().toISOString().split('T')[0];
      const dramaName = document.querySelector('input.dramaName')?.value || '';
      const comments = document.querySelector('textarea.comments')?.value || '';
      const where = document.querySelector('input.whereToWatch')?.value || '';
      const viewed = true;
      const dramaId = document.querySelector('input.dramaId')?.value || null;

      const payload = {
        date,
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
        addEntryToDOM(dramaName, comments);
      }
    });
  }

  // Add-modal behavior
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
      const viewed = true;

      const payload = {
        date,
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
        addEntryToDOM(dramaName, comments);
        addModal.style.display = 'none';
      }
    });
  }
  // Move the entry back to the watchlist.
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('.move-to-watchlist-btn');
    if (!button) return;

    const id = button.dataset.id;
    const ok = await updateEntry(id, { viewed: false });
    if (ok) {
      window.location.reload();
    } else {
      console.error('Error moving entry back to watchlist');
    }
  });

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
      const viewed = true;

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
  function addEntryToDOM(name, comments) {
    const container = document.querySelector('.entries') || document.querySelector('.indexTopBar');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'entry';

    const title = document.createElement('div');
    title.className = 'entryWatchlist';
    title.textContent = name;

    const contentEl = document.createElement('div');
    contentEl.className = 'entryContent';
    contentEl.textContent = comments;

    div.appendChild(title);
    div.appendChild(contentEl);
    container.appendChild(div);
  }
});