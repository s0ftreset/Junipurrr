(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const dialog = byId('photo-dialog');
  let photos = [], current = 0, storyMap = new Map();

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
  function artwork(photo) {
    const image = node('img');
    image.alt = photo.alt;
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.replaceWith(node('span', 'missing-photo', 'Photo unavailable · ' + photo.alt));
    }, {once:true});
    image.src = window.JuniCore.safeUrl(photo.image, true);
    return image;
  }
  function control(label, mark, className, action) {
    const button = node('button', className, mark);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', action);
    return button;
  }
  function paint(prefix) {
    const photo = photos[current];
    const story = storyMap.get(photo.storyId);
    byId(prefix + 'frame').replaceChildren(artwork(photo));
    byId(prefix + 'title').textContent = photo.title;
    byId(prefix + 'caption').textContent = photo.caption || '';
    byId(prefix + 'position').textContent = (current + 1) + ' / ' + photos.length;
    const links = byId(prefix + 'links');
    links.replaceChildren();
    if (story) links.append(anchor(story.title + ' →', '#story/' + encodeURIComponent(story.id)));
  }
  function advance(step) {
    if (photos.length < 2) return;
    current = (current + step + photos.length) % photos.length;
    paint('roll-');
    if (dialog.open) paint('photo-');
  }
  function enlarge() {
    paint('photo-');
    byId('photo-prev').hidden = byId('photo-next').hidden = photos.length < 2;
    dialog.showModal();
  }
  byId('photo-prev').addEventListener('click', () => advance(-1));
  byId('photo-next').addEventListener('click', () => advance(1));
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
  document.addEventListener('keydown', event => {
    if (!byId('roll-frame') || byId('detail-view').hidden || event.defaultPrevented ||
        event.altKey || event.metaKey || event.ctrlKey || event.shiftKey ||
        event.target.closest('select,input,textarea,[contenteditable=true]') ||
        document.querySelector('dialog[open]:not(#photo-dialog)')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  function albumPicker(content, storyId) {
    const albumIds = new Set(content.gallery.map(photo => photo.storyId));
    const label = node('label', 'roll-filter', 'Album');
    const select = node('select');
    select.append(new Option('All photos', ''));
    content.worlds.filter(story => albumIds.has(story.id)).forEach(story => select.append(new Option(story.title, story.id)));
    if (storyId && !albumIds.has(storyId)) select.append(new Option(storyMap.get(storyId)?.title || 'Unavailable album', storyId));
    select.value = storyId;
    select.addEventListener('change', () => { location.hash = select.value ? '#gallery/' + encodeURIComponent(select.value) : '#gallery'; });
    label.append(select);
    return label;
  }
  function viewer() {
    const figure = node('figure', 'roll-viewer');
    const stage = node('div', 'roll-stage');
    const multiple = photos.length > 1;
    const frame = control(multiple ? 'Show next photo' : 'Enlarge photo', '', 'roll-art', multiple ? () => advance(1) : enlarge);
    frame.id = 'roll-frame';
    const previous = control('Previous photo', '←', 'roll-arrow previous', () => advance(-1));
    const next = control('Next photo', '→', 'roll-arrow next', () => advance(1));
    previous.hidden = next.hidden = !multiple;
    stage.append(frame, previous, next);
    const caption = node('figcaption', 'roll-caption');
    const info = node('div', 'roll-info');
    const title = node('h2'), position = node('span', 'roll-position');
    title.id = 'roll-title';
    position.id = 'roll-position';
    const name = node('div', 'roll-name');
    name.setAttribute('aria-live', 'polite');
    name.setAttribute('aria-atomic', 'true');
    name.append(title, position);
    const note = node('p'), links = node('div');
    note.id = 'roll-caption';
    links.id = 'roll-links';
    info.append(name, note, links);
    caption.append(info, control('Enlarge photo', 'Enlarge ⤢', 'text-link roll-enlarge', enlarge));
    figure.append(stage, caption);
    return figure;
  }
  function render(content, storyId) {
    storyMap = new Map(content.worlds.map(story => [story.id, story]));
    photos = storyId ? content.gallery.filter(photo => photo.storyId === storyId) : content.gallery;
    current = 0;
    const view = byId('detail-view');
    view.className = 'detail-view gallery-view';
    const header = node('header', 'gallery-head');
    header.append(node('h1', '', 'The camera roll'), albumPicker(content, storyId));
    view.replaceChildren(anchor('← Back to the stories', '#collection'), header);
    if (photos.length) {
      view.append(viewer());
      paint('roll-');
    } else {
      view.append(node('p', 'gallery-empty', 'No photos in this album yet.'));
    }
    document.title = 'The camera roll · Junipurrr';
  }
  window.JuniGallery = {render};
})();
