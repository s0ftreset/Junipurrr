(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const dialog = byId('photo-dialog');
  let photos = [], storyMap = new Map(), current = 0;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function anchor(label, href) {
    const a = node('a', 'text-link', label);
    a.href = href;
    return a;
  }
  function artwork(photo, enlarged) {
    const image = node('img');
    image.alt = photo.alt;
    image.loading = enlarged ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.replaceWith(node('span', 'missing-photo', 'Photo unavailable · ' + photo.alt));
    }, {once:true});
    image.src = window.JuniCore.safeUrl(photo.image, true);
    return image;
  }
  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current], story = storyMap.get(photo.storyId);
    byId('photo-frame').replaceChildren(artwork(photo, true));
    byId('photo-title').textContent = photo.title;
    byId('photo-caption').textContent = photo.caption || '';
    byId('photo-position').textContent = 'Photo ' + (current + 1) + ' of ' + photos.length;
    const links = byId('photo-links');
    links.replaceChildren();
    if (story) {
      const openStory = anchor('Open story · ' + story.title + ' →', '#story/' + encodeURIComponent(story.id));
      openStory.addEventListener('click', () => dialog.close());
      links.append(openStory);
    }
    byId('photo-prev').hidden = byId('photo-next').hidden = photos.length < 2;
    if (!dialog.open) dialog.showModal();
  }
  byId('photo-prev').addEventListener('click', () => showPhoto(current - 1));
  byId('photo-next').addEventListener('click', () => showPhoto(current + 1));
  dialog.addEventListener('keydown', event => {
    if (photos.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });

  function render(content, storyId) {
    storyMap = new Map(content.worlds.map(story => [story.id, story]));
    const albumIds = new Set(content.gallery.map(photo => photo.storyId));
    photos = storyId ? content.gallery.filter(photo => photo.storyId === storyId) : content.gallery;
    const view = byId('detail-view');
    view.className = 'detail-view gallery-view';
    const header = node('header', 'gallery-head');
    header.append(node('h1', '', 'The camera roll'), node('p', '', 'Portraits, scene stills, and the photos I got a little too attached to. ♡'));
    const tools = node('div', 'gallery-tools');
    const label = node('label', '', 'Browse by story');
    const select = node('select');
    select.append(new Option('All photos', ''));
    content.worlds.filter(story => albumIds.has(story.id)).forEach(story => select.append(new Option(story.title, story.id)));
    if (storyId && !albumIds.has(storyId)) select.append(new Option(storyMap.get(storyId)?.title || 'Unavailable album', storyId));
    select.value = storyId;
    select.addEventListener('change', () => { location.hash = select.value ? '#gallery/' + encodeURIComponent(select.value) : '#gallery'; });
    label.append(select);
    tools.append(label, node('span', 'gallery-count', photos.length + (photos.length === 1 ? ' photo' : ' photos')));
    const grid = node('div', 'photo-grid');
    photos.forEach((photo, index) => {
      const figure = node('figure', 'gallery-print');
      const open = node('button', 'photo-open');
      open.type = 'button';
      open.setAttribute('aria-label', 'Enlarge ' + photo.title);
      open.append(artwork(photo, false));
      open.addEventListener('click', () => showPhoto(index));
      const caption = node('figcaption');
      caption.append(node('h2', '', photo.title));
      const story = storyMap.get(photo.storyId);
      if (story) caption.append(anchor(story.title + ' →', '#story/' + encodeURIComponent(story.id)));
      figure.append(open, caption);
      grid.append(figure);
    });
    if (!photos.length) grid.append(node('p', 'gallery-empty', 'No photos in this album yet.'));
    view.replaceChildren(anchor('← Back to the stories', '#collection'), header, tools, grid);
    document.title = 'The camera roll · Junipurrr';
  }
  window.JuniGallery = {render};
})();
