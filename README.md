# Junipurrr ☾

A little lore. A lot of emotional damage.

A personal home for Junipurrr's DreamJourney AI worlds, bots, and works in progress. Blackletter typography, dusty pink details, candlelit artwork, and Cricket, Editorial Supervisor.

## Explore Juni’s study

- The homepage has a handwritten note, a featured story, and entrances to the collection, worlds, and project desk.
- Browse characters and scenarios separately, combine search and genre filters, or keep favorites on a saved shelf in your browser.
- Each story has a shareable `#story/<id>` page for its premise, player role, complications, cast, optional opening previews, lore, and DJAI link.
- Worlds have their own `#world/<id>` pages and atmospheres: lounge, manor, stage, desert, stairs, romance, society, or dragon.
- The mood picker matches setting, relationship, and intensity. Questions can be skipped, and partial matches are labelled. “Let Cricket choose” picks a random story.
- Project notes support artwork, linked stories, progress stages, and finished releases. Cricket has opinions; the footer also hides the name graveyard.
- The bouncing DVD can be paused and respects the device’s reduced-motion preference.

## Publish on GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/ (root)**, then click **Save**.
4. GitHub will show the published address when deployment finishes. For this repository, the expected address is `https://s0ftreset.github.io/Junipurrr/`.

The site is plain HTML, CSS, and JavaScript. No build, paid service, API key, or package installation is needed. Do not add a custom domain unless you own it.

## Add or update your bots and projects

Use **Creator desk** in the website footer:

1. Choose **The study**, **Stories**, **Worlds**, **Project notes**, or **Name graveyard**.
2. Choose an existing entry to edit it, or **Start a new entry**.
3. Edit the fields. Stories support cast members, opening previews, lore notes, a world, and mood-picker choices. The study controls your note, featured story, Cricket’s messages, and profile details.
4. **Save browser draft** previews changes on this device. It does **not** publish them.
5. Click **Export content.js**.
6. On GitHub, open `content.js` → pencil icon, replace its contents with the exported file's contents, and commit to `main`. You can also upload the exported file through **Add file → Upload files**, replacing the existing file.
7. GitHub Pages publishes the update. Allow a few minutes for its deployment and refresh the page.

The editor is available to visitors, but it only edits each visitor's own browser storage. It cannot change this repository or the live site. A visitor cannot see drafts stored in your browser. Do not use the public repository to store unpublished secrets.

**Back up as JSON** downloads a reusable backup for **Import content.json** on another device. Browser storage can be cleared; export drafts you want to keep. Edits that have not been saved with **Save browser draft** are not included in an export.

**Preview published version** shows the repository’s content without deleting the saved draft. **Reload saved draft** brings it back. Removing an entry only affects your draft, and the most recent removal can be undone. Backups from the original editor are still supported.

Favorites are separate from creator drafts and stay on the current device. Spoiler labels hide text visually; published lore is still part of the public website. Keep unpublished lore in your browser draft or private backups.

### Artwork

Add a file to `assets/` through GitHub, then enter its path (for example `assets/my-bot.webp`) in the editor's cover-image field. Alternatively use a stable HTTPS image URL that permits embedding. Use compressed WebP or JPEG for photographs and illustrations. Covers are cropped to fill the card.

### Direct editing

All published text and collection entries live in `content.js`:

- `profileUrl`: your DJAI creator link.
- `discord`: the handle copied by the Discord button.
- `about`: the introduction.
- `home`: the handwritten note, featured story ID and note, and Cricket messages.
- `worlds`: character and scenario entries (the original key is retained for backup compatibility).
- `collections`: world pages referenced by each story’s `worldId`.
- `notes`: project notes with statuses, optional artwork, links, and `storyId`.
- `graveyard`: rejected names with causes and verdicts.

Existing story descriptions, artwork, and direct bot links are preserved. Extra story sections only appear when their fields contain content. An entry without a direct `url` has a clearly labelled creator-profile button. Opening previews are summaries unless you supply the actual opening text. Add richer cast, player-role, opening, and lore details through the Creator desk as you develop them.

Keep entry IDs stable: they form shareable URLs. Lore entries use `{ title, text, spoiler }`; cast entries use `{ name, role, image }`; opening previews use `{ title, text, url }`. Mood values are defined in `core.js`. Leave a mood unspecified if it does not fit; the picker will not count it as a match.

## Preview locally

From this folder, run `python3 -m http.server 8000` and open `http://localhost:8000`. Serve the repository root, not its parent.

With Node.js available, run `node --test tests/content.test.cjs` for content, reference, artwork, backup migration, URL validation, filtering, and recommendation checks. No npm install is needed.

## Files

- `index.html` — page structure and editor.
- `style.css` — responsive gothic theme.
- `app.js` — routing, collection browsing, recommendations, Cricket, and browser-only editor.
- `core.js` — shared content validation, backup migration, filtering, and matching rules.
- `content.js` — published content.
- `assets/hero.webp` — original generated banner based on the supplied avatar, with an orange tabby.
- `assets/juni-portrait.webp` — optimized creator-supplied portrait.
- `assets/favicon.svg` — small crescent icon.
- `assets/cricket.svg` — sleeping orange tabby illustration.
- `tests/content.test.cjs` — dependency-free content and behavior checks.
- `.nojekyll` — tells GitHub Pages to serve these files directly.

Fonts use Google Fonts, with local system fallbacks. No analytics or third-party scripts are included. The banner was made with the built-in image generation tool from the prompt: “A candlelit gothic study, the reference adult woman with long black hair, pink bows and crescent jewelry cuddling an orange tabby on the right, uncluttered dark study on the left for text; dusty pink and black palette; no text or UI.”

The Dragon Crown entries use Juni’s supplied Zhaevran portrait and approved Zhaedrik and Kharveth aerie artwork, optimized as WebP. Azheryth is a separate setting from Elyndor. The character buttons link directly to their published DJAI bots.
