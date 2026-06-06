document.addEventListener('DOMContentLoaded', () => {
  // Reusable helper: POST an entry to the server
  async function sendEntry(entry) {
    try {
      const res = await fetch('/alreadyWatchlist', {
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

  // Keep the simple submitButton handler format you prefer.
  // This block gathers fields, builds `entry`, and calls sendEntry.
  const submitButton = document.querySelector('input.submit');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      const date = document.querySelector('input.date')?.value || new Date().toISOString().split('T')[0];
      const dramaName = document.querySelector('input.dramaName')?.value || '';
      const comments = document.querySelector('textarea.comments')?.value || '';
      const where = document.querySelector('input.whereToWatch')?.value || '';
      const viewed = true;

      const entry = { date, dramaName, comments, where, viewed };

      const ok = await sendEntry(entry);
      if (ok) {
        window.location = '/';
      } else {
        console.error('error creating entry');
        // optimistic UI: show the new item locally
        addEntryToDOM(dramaName, comments);
      }
    });
  }

  // Modal add-drama form behavior (reuses sendEntry)
  const addBtn = document.getElementById('addDramaBtn');
  const modal = document.getElementById('addDramaModal');
  const form = document.getElementById('addDramaForm');
  const cancel = document.getElementById('modalCancel');

  if (addBtn && modal && form) {
    addBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      document.getElementById('dramaName').focus();
    });

    cancel && cancel.addEventListener('click', () => {
      form.reset();
      modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dramaName = document.getElementById('dramaName').value.trim();
      const comments = document.getElementById('comments').value.trim();
      const where = document.getElementById('whereToWatch').value.trim();
      if (!dramaName) return;

      const date = new Date().toISOString().split('T')[0];
      const viewed = true;
      const entry = { date, dramaName, comments, where, viewed };

      const ok = await sendEntry(entry);
      if (ok) {
        modal.style.display = 'none';
        window.location.reload();
      } else {
        console.error('server error when creating entry');
        addEntryToDOM(dramaName, comments);
        modal.style.display = 'none';
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