# Junipurrr ☾

A little lore. A lot of emotional damage.

A personal home for Junipurrr's DreamJourney AI worlds, bots, and works in progress. Blackletter typography, dusty pink details, candlelit artwork, and an orange cat.

## Publish on GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/ (root)**, then click **Save**.
4. GitHub will show the published address when deployment finishes. For this repository, the expected address is `https://s0ftreset.github.io/Junipurrr/`.

The site is plain HTML, CSS, and JavaScript. No build, paid service, API key, or package installation is needed. Do not add a custom domain unless you own it.

## Add or update your bots and projects

Use **Creator desk** in the website footer:

1. Choose **Worlds & bots** or **Project notes**.
2. Choose an existing entry to edit it, or **Start a new entry**.
3. Add its title, description, tags, optional artwork, and the individual DJAI bot URL. Choose a status for project notes.
4. **Save browser draft** previews changes on this device. It does **not** publish them.
5. Click **Export content.js**.
6. On GitHub, open `content.js` → pencil icon, replace its contents with the exported file's contents, and commit to `main`. You can also upload the exported file through **Add file → Upload files**, replacing the existing file.
7. GitHub Pages publishes the update. Allow a few minutes for its deployment and refresh the page.

The editor is available to visitors, but it only edits each visitor's own browser storage. It cannot change this repository or the live site. A visitor cannot see drafts stored in your browser. Do not use the public repository to store unpublished secrets.

**Back up as JSON** downloads a reusable backup for **Import content.json** on another device. Browser storage can be cleared; export drafts you want to keep. Edits that have not been saved with **Save browser draft** are not included in an export.

### Artwork

Add a file to `assets/` through GitHub, then enter its path (for example `assets/my-bot.webp`) in the editor's cover-image field. Alternatively use a stable HTTPS image URL that permits embedding. Use compressed WebP or JPEG for photographs and illustrations. Covers are cropped to fill the card.

### Direct editing

All published text and collection entries live in `content.js`:

- `profileUrl`: your DJAI creator link.
- `discord`: the handle copied by the Discord button.
- `about`: the introduction.
- `worlds`: collection or individual bot entries.
- `notes`: project notes with statuses.

The initial six worlds are based on creator-provided setting notes. Their decorative covers are typographic designs; no bot artwork, release status, or individual bot URL has been invented. Cards without a direct `url` open the creator profile, explicitly labelled as such. Replace these with individual bots and your chosen cover art whenever you like.

## Preview locally

From this folder, run `python3 -m http.server 8000` and open `http://localhost:8000`. Serve the repository root, not its parent.

## Files

- `index.html` — page structure and editor.
- `style.css` — responsive gothic theme.
- `app.js` — collection search, filters, details, and browser-only editor.
- `content.js` — published content.
- `assets/hero.webp` — original generated banner based on the supplied avatar, with an orange tabby.
- `assets/juni-portrait.webp` — optimized creator-supplied portrait.
- `assets/favicon.svg` — small crescent icon.
- `.nojekyll` — tells GitHub Pages to serve these files directly.

Fonts use Google Fonts, with local system fallbacks. No analytics or third-party scripts are included. The banner was made with the built-in image generation tool from the prompt: “A candlelit gothic study, the reference adult woman with long black hair, pink bows and crescent jewelry cuddling an orange tabby on the right, uncluttered dark study on the left for text; dusty pink and black palette; no text or UI.”
