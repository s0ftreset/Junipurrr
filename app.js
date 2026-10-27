(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const published = clone(window.JUNIPURRR_CONTENT);
  let content = clone(published);
  let filter = 'all';
  let studioType = 'worlds';
  let studioLoaded = false;
  const storageKey = 'junipurrr-creator-draft-v1';
  const themes = new Set(['lounge', 'manor', 'stage', 'desert', 'stairs', 'romance']);
  const statusMessage = $('#studio-status');
  const form = $('#studio-form');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function safeUrl(value, image = false) {
    if (typeof value !== 'string' || !value.trim()) return '';
    if (image && /^assets\/[a-z0-9/_\-.]+$/i.test(value) && !value.includes('..')) return value;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  }
  function validContent(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.worlds) || !Array.isArray(value.notes)) return false;
    if (value.worlds.length > 200 || value.notes.length > 200) return false;
    if (typeof value.about !== 'string' || typeof value.discord !== 'string' || !safeUrl(value.profileUrl)) return false;
    for (const list of [value.worlds, value.notes]) {
      const ids = new Set();
      for (const item of list) {
        if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.title !== 'string' || typeof item.description !== 'string') return false;
        if (item.title.length > 100 || item.description.length > 2000 || (item.subtitle !== undefined && typeof item.subtitle !== 'string')) return false;
        if (item.url && !safeUrl(item.url)) return false;
        if (item.image && !safeUrl(item.image, true)) return false;
        if (item.tags !== undefined && (!Array.isArray(item.tags) || !item.tags.every(tag => typeof tag === 'string'))) return false;
        ids.add(item.id);
      }
    }
    return value.worlds.every(item => ['original','fandom','fantasy'].includes(item.category)) && value.notes.every(item => !item.status || typeof item.status === 'string');
  }
  function externalLink(text, url, className) {
    const link = el('a', className, text);
    link.href = safeUrl(url) || published.profileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }
  function cover(world, extra = '') {
    const theme = themes.has(world.theme) ? world.theme : 'romance';
    const node = el('div', `world-cover cover-${theme} ${extra}`);
    node.setAttribute('aria-hidden', 'true');
    const image = safeUrl(world.image, true);
    if (image) {
      node.classList.add('has-image');
      node.style.backgroundImage = `url(${JSON.stringify(image)})`;
    }
    node.append(el('span', 'cover-sigil', theme === 'manor' ? '☾' : '✧'));
    node.append(el('span', 'cover-title', world.coverTitle || world.title));
    if (world.coverNote) node.append(el('span', 'cover-note', world.coverNote));
    return node;
  }
  function renderWorlds() {
    const term = $('#collection-search').value.trim().toLocaleLowerCase();
    const worlds = content.worlds.filter(world => {
      const tags = world.tags || [];
      const matchesFilter = filter === 'all' || world.category === filter || (filter === 'fantasy' && tags.some(tag => tag.toLowerCase().includes('fantasy')));
      const searchText = [world.title, world.subtitle, world.description, ...tags].join(' ').toLocaleLowerCase();
      return matchesFilter && (!term || searchText.includes(term));
    });
    const grid = $('#world-grid');
    grid.replaceChildren();
    worlds.forEach(world => {
      const article = el('article', 'world-card');
      const button = el('button', 'world-open');
      button.type = 'button';
      button.setAttribute('aria-label', `Explore ${world.title}`);
      button.append(cover(world));
      const info = el('div', 'world-info');
      const heading = el('div', 'world-heading');
      heading.append(el('h3', '', world.title));
      const arrow = el('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      heading.append(arrow);
      info.append(heading, el('p', 'world-subtitle', world.subtitle || 'A world by Junipurrr'));
      const tags = el('div', 'world-tags');
      (world.tags || []).slice(0, 3).forEach(tag => tags.append(el('span', '', tag)));
      info.append(tags);
      button.append(info);
      button.addEventListener('click', () => openWorld(world));
      article.append(button);
      grid.append(article);
    });
    $('#empty-state').hidden = worlds.length > 0;
    $('#result-count').textContent = `${worlds.length} ${worlds.length === 1 ? 'world' : 'worlds'} to wander${term ? ` · matching “${$('#collection-search').value.trim()}”` : ''}`;
  }
  function openWorld(world) {
    const detail = $('#world-detail');
    detail.replaceChildren();
    const title = el('h2', '', world.title);
    title.id = 'dialog-title';
    detail.append(cover(world, 'dialog-cover'), el('p', 'eyebrow', 'Notes from this world'), title, el('p', 'detail-subtitle', world.subtitle || ''), el('p', 'detail-description', world.description));
    const tags = el('div', 'detail-tags');
    (world.tags || []).forEach(tag => tags.append(el('span', '', tag)));
    detail.append(tags);
    const directUrl = safeUrl(world.url);
    detail.append(externalLink(directUrl ? 'Open this bot on DJAI ↗' : 'Browse my DJAI profile ↗', directUrl || content.profileUrl, 'button button-pink'));
    if (!directUrl) detail.append(el('p', 'detail-footnote', 'Explore this collection through my creator profile.'));
    $('#world-dialog').showModal();
  }
  function renderNotes() {
    const notes = $('#desk-notes');
    notes.replaceChildren();
    if (!content.notes.length) notes.append(el('p', 'desk-empty', 'The desk is freshly cleared. Something new will land here soon.'));
    content.notes.forEach(note => {
      const article = el('article', 'project-note');
      const top = el('div', 'note-top');
      top.append(el('h3', '', note.title));
      top.append(el('span', 'status-pill', note.status || 'In progress'));
      article.append(top);
      if (note.subtitle) article.append(el('p', 'note-subtitle', note.subtitle));
      article.append(el('p', '', note.description));
      if (safeUrl(note.url)) article.append(externalLink('Take a peek ↗', note.url, 'text-link'));
      notes.append(article);
    });
  }
  function render() {
    renderWorlds();
    renderNotes();
    $('#about-text').textContent = content.about;
    $$('.profile-link').forEach(link => link.href = safeUrl(content.profileUrl) || published.profileUrl);
  }
  $$('.filters button').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    $$('.filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderWorlds();
  }));
  $('#collection-search').addEventListener('input', renderWorlds);
  $('#clear-search').addEventListener('click', () => {
    filter = 'all';
    $('#collection-search').value = '';
    $$('.filters button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === 'all')));
    renderWorlds();
    $('#collection-search').focus();
  });
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $('#copy-discord').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(content.discord);
      $('#copy-status').textContent = `${content.discord} copied ♡`;
    } catch { $('#copy-status').textContent = `Discord: ${content.discord}`; }
  });

  function saveDraft() {
    render();
    try {
      localStorage.setItem(storageKey, JSON.stringify(content));
      statusMessage.textContent = 'Draft saved in this browser. Export when you’re ready to update the website.';
    } catch { statusMessage.textContent = 'This browser could not save the draft. Export it now to keep your changes.'; }
  }
  function renderStudioList() {
    const list = $('#studio-list');
    list.replaceChildren();
    content[studioType].forEach(item => {
      const group = el('span', 'entry-group');
      const button = el('button', 'entry-select', item.title);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(form.elements.id.value === item.id));
      button.addEventListener('click', () => fillForm(item));
      const remove = el('button', 'entry-delete', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Delete browser draft entry ${item.title}`);
      remove.addEventListener('click', () => {
        content[studioType] = content[studioType].filter(entry => entry.id !== item.id);
        if (form.elements.id.value === item.id) form.reset();
        saveDraft();
        renderStudioList();
      });
      group.append(button, remove);
      list.append(group);
    });
  }
  function fillForm(item = {}) {
    form.reset();
    const fields = ['id', 'title', 'subtitle', 'description', 'url', 'image', 'category', 'status'];
    fields.forEach(name => { if (item[name] !== undefined) form.elements[name].value = item[name]; });
    form.elements.tags.value = (item.tags || []).join(', ');
    for (const name of ['tags','category','image']) form.elements[name].closest('label').hidden = studioType === 'notes';
    $('.note-status-label').hidden = studioType !== 'notes';
    renderStudioList();
  }
  $('#open-studio').addEventListener('click', () => {
    if (!studioLoaded) {
      try {
        const draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (validContent(draft)) {
          content = clone(draft);
          render();
          statusMessage.textContent = 'Loaded your browser draft. The page now previews your draft content.';
        }
      } catch { statusMessage.textContent = 'Starting from published content; a saved draft could not be read.'; }
      studioLoaded = true;
    }
    fillForm();
    $('#studio-dialog').showModal();
  });
  $$('[data-studio]').forEach(button => button.addEventListener('click', () => {
    studioType = button.dataset.studio;
    $$('[data-studio]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    fillForm();
  }));
  $('#new-entry').addEventListener('click', () => {
    fillForm();
    form.elements.title.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = form.elements;
    const url = fields.url.value.trim();
    const image = fields.image.value.trim();
    if (url && !safeUrl(url)) { statusMessage.textContent = 'Please use an https:// link.'; fields.url.focus(); return; }
    if (studioType === 'worlds' && image && !safeUrl(image, true)) { statusMessage.textContent = 'Use an https:// image URL or an assets/ filename.'; fields.image.focus(); return; }
    if (!fields.title.value.trim() || !fields.description.value.trim()) { statusMessage.textContent = 'Add a title and description before saving.'; return; }
    const list = content[studioType];
    const existing = list.find(item => item.id === fields.id.value);
    if (!existing && list.length >= 200) { statusMessage.textContent = 'This collection is full (200 entries). Remove an entry before adding another.'; return; }
    const item = {
      ...(existing || {}),
      id: existing?.id || `entry-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      title: fields.title.value.trim(),
      subtitle: fields.subtitle.value.trim(),
      description: fields.description.value.trim(),
      url
    };
    if (studioType === 'worlds') {
      item.category = fields.category.value;
      item.tags = fields.tags.value.split(',').map(value => value.trim()).filter(Boolean);
      item.image = image;
      // User-edited titles should also update decorative cover lettering.
      if (existing?.title !== item.title) item.coverTitle = item.title;
    } else item.status = fields.status.value;
    if (existing) list[list.indexOf(existing)] = item;
    else list.push(item);
    saveDraft();
    fillForm(item);
  });
  function download(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = el('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('#export-content').addEventListener('click', () => {
    download('content.js', `/* Junipurrr website content. Exported from the Creator desk. */\nwindow.JUNIPURRR_CONTENT = ${JSON.stringify(content, null, 2)};\n`, 'text/javascript');
    statusMessage.textContent = 'Exported content.js. Replace that file in your GitHub repository to publish these entries.';
  });
  $('#export-json').addEventListener('click', () => download('junipurrr-content.json', JSON.stringify(content, null, 2), 'application/json'));
  $('#import-content').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('Too large');
      const imported = JSON.parse(await file.text());
      if (!validContent(imported)) throw new Error('Invalid content');
      content = clone(imported);
      saveDraft();
      fillForm();
    } catch { statusMessage.textContent = 'That file could not be imported. Choose a valid Junipurrr JSON backup under 2 MB.'; }
    event.target.value = '';
  });
  render();
})();
