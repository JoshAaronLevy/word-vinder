# Scrabble Implementation Plan (Front-End)
Owner: Josh  
Target: Add Scrabble as a first-class game in the Word Vinder UI with screenshot upload → API analysis → confirm UI.

## Context & Problem
We added a new Dify flow that can extract a Scrabble board from a screenshot. The Dify flow is responsible for selecting the correct extraction behavior. The UI must now:
- Add a Scrabble tile on Home
- Add a `/scrabble` route + page
- Implement screenshot upload + analysis dialog similar to Wordscapes
- Call the existing Node API endpoint (same endpoint used by Wordscapes) and log:
  - the outgoing payload (at least file metadata; we cannot directly log a FormData boundary, but we can log the file info and endpoint)
  - the response payload (full object)
- Display extracted Scrabble data (rack + 15x15 board) in a confirm step before closing the dialog

### Expected Scrabble Schema (from Dify)
The model returns JSON in the shape:
```json
{
  "schema": "WORDVINDER_SCRABBLE_EXTRACT_V1",
  "game": "SCRABBLE",
  "rack": [
    { "letter": "A", "points": 1, "isBlank": false },
    { "letter": null, "points": 0, "isBlank": true }
  ],
  "board": {
    "size": 15,
    "tiles": [
      [null, null, "... 15 columns total ..."],
      "... 15 rows total ..."
    ]
  },
  "notes": []
}
```

### Project Patterns to Follow

* Wordscapes page has a full “upload screenshot → steps modal → analyzeBoard(file) → confirm → close” flow:

  * `src/features/wordscapes/pages/WordscapesPage.tsx`
* API call helper currently lives here:

  * `src/services/analyzeBoard.ts`
* Home tiles live here:

  * `src/app/home/HomePage.tsx`
* Route table and nav links live here:

  * `src/App.tsx` (routes)
  * `src/app/routes.ts` (header links)
* Screenshot compression helper:

  * `src/shared/utils/imageCompression.ts` via `compressImageIfNeeded`

## Constraints

### ✅ Do NOT write tests

No unit tests, no integration tests, no Playwright/Cypress.

### Keep it maintainable

* Prefer a small Scrabble feature folder (`src/features/scrabble/...`)
* Don’t dump everything into one mega file if it’s obviously reusable (rendering rack/board should be components).
* Keep types explicit and safe, but do not over-engineer.

---

# Stage 1 — Add Scrabble to Home + Routing Skeleton

## Goals

* Add a Scrabble tile to the Home page (same card style as other games).
* Add `/scrabble` route and add Scrabble to the top nav links.
* Create a basic `ScrabblePage` that renders a header + “coming soon” placeholder so navigation works end-to-end.

## Files to Change / Add

1. `src/app/home/HomePage.tsx`

* Import Scrabble image (already present as `src/assets/Scrabble.png`)
* Add an entry to the `helpers` array:

  * key: `scrabble`
  * title: `Scrabble`
  * description: something like “Upload a screenshot to extract your rack + board.”
  * path: `/scrabble`
  * image: ScrabbleImage
  * imageAlt: appropriate text

2. `src/app/routes.ts`

* Add `{ path: '/scrabble', label: 'Scrabble' }` in `gameLinks` (order can be whatever you prefer; probably alongside the others).

3. `src/App.tsx`

* Import `ScrabblePage` from `src/features/scrabble/pages/ScrabblePage`
* Add `<Route path="/scrabble" element={<ScrabblePage />} />`

4. Add new file: `src/features/scrabble/pages/ScrabblePage.tsx`

* Minimal scaffold:

  * `<section className="page">`
  * Header area consistent with other pages
  * Text placeholder like “Scrabble screenshot analysis coming next stage.”

## Acceptance Criteria

* Home shows Scrabble tile
* Clicking navigates to `/scrabble`
* Top nav includes Scrabble
* App builds and lints

---

# Stage 2 — Add Scrabble Types + Make analyzeBoard Accept Multiple Schemas (Safely)

## Goals

* Extend the front-end type system so the API response can represent either:

  * Wordscapes extract (existing)
  * Scrabble extract (new)
* Add lightweight type guards so the Scrabble page can safely interpret the result without breaking Wordscapes.
* Add explicit console logging for request metadata + response payload.

## Files to Change / Add

1. `src/services/analyzeBoard.ts`

### A) Add new Scrabble types

Add:

* `export type ScrabbleRackTile = { letter: string | null; points: number; isBlank: boolean }`
* `export type ScrabbleBoard = { size: 15; tiles: Array<Array<string | null>> }`

  * Note: tiles element type might eventually become `{ letter, points, isBlank }`, but for now match what Dify returns: `string | null`
* `export type ScrabbleBoardState = { schema: 'WORDVINDER_SCRABBLE_EXTRACT_V1'; game: 'SCRABBLE'; rack: ScrabbleRackTile[]; board: ScrabbleBoard; notes?: string[] }`

### B) Rename existing BoardState to be game-specific

* Rename current `export type BoardState = ...` to `export type WordscapesBoardState = ...`
* Keep the existing shape exactly as-is.

### C) Define a union type

* `export type AnyBoardState = WordscapesBoardState | ScrabbleBoardState`

### D) Update AnalyzeBoardOk to use the union

Change:

* `board: BoardState`
  to:
* `board: AnyBoardState`

Keep `summary` as-is (Wordscapes uses it). For Scrabble, `summary` may exist or may be irrelevant; that’s fine—Scrabble page can ignore it.

### E) Add type guards

Add:

* `export const isScrabbleBoardState = (value: AnyBoardState): value is ScrabbleBoardState => value?.schema === 'WORDVINDER_SCRABBLE_EXTRACT_V1' && value?.game === 'SCRABBLE'`
* `export const isWordscapesBoardState = (value: AnyBoardState): value is WordscapesBoardState => value?.schema === 'WORDVINDER_BOARD_EXTRACT_V4' && value?.game === 'WORDSCAPES'`

### F) Add request/response logging in analyzeBoard

Before `fetch(...)`, add:

* `console.log('[WordVinder] analyzeBoard request:', { endpoint, file: { name: file.name, size: file.size, type: file.type } })`

After parsing JSON (regardless of ok/err), add:

* `console.log('[WordVinder] analyzeBoard raw response:', payload)`

Do NOT log giant base64 blobs (we aren’t sending any anyway). Just log the parsed response object.

2. Update Wordscapes imports/types
   Where Wordscapes currently does:

* `import type { BoardState } from '../../../services/analyzeBoard'`
  Update it to:
* `import type { WordscapesBoardState } from '../../../services/analyzeBoard'`
  and update the local state types accordingly.

## Acceptance Criteria

* Wordscapes continues to compile with updated types
* `analyzeBoard` logs:

  * request endpoint + file metadata
  * response object
* Type guards exist and compile

---

# Stage 3 — Scrabble Page: Screenshot Upload + Analysis Dialog (Wordscapes-like flow)

## Goals

Implement a Scrabble page modeled after Wordscapes’ upload workflow:

* Upload screenshot via PrimeReact `FileUpload`
* Compress image if needed
* Call `analyzeBoard(uploadFile)`
* Show a PrimeReact `Dialog` with a `Steps` component
* Store and show the extracted Scrabble board state
* Include a confirm step before closing

## Files to Add / Change

1. Add: `src/features/scrabble/pages/ScrabblePage.tsx` (replace placeholder from Stage 1)
   Core requirements:

* Use `useAppContext()` to read `difyPingStatus` and disable upload unless it is `'ok'` (same pattern as Wordscapes).
* Reuse the compression call:

  * `compressImageIfNeeded(file, { thresholdBytes: 2MB, maxSizeMB: ~0.95, maxWidthOrHeight: 1920 })`
* Implement state roughly like Wordscapes (but simpler):

  * `selectedFile`
  * `analysisDialogVisible`
  * `activeIndex` for steps
  * `completedSteps`
  * `analysisComplete`
  * `selectedScreenshot` (original)
  * `extractedScrabbleBoard` (type: `ScrabbleBoardState | null`)
  * `errorMessage` (string | null)

### Suggested steps

Keep it close to Wordscapes but you can reduce step count:

1. “Prepare image” (compression/resizing)
2. “Analyze screenshot” (API call)
3. “Review extraction” (show rack/board)
4. “Complete” (short success message, then auto-close OR close on button)

### Logging requirements (Scrabble page)

In the page logic:

* After compression, log the upload file metadata:

  * `console.log('[WordVinder] Scrabble upload payload:', { endpoint: getApiBaseUrl() + '/api/v1/board/parse-screenshot', file: { name, size, type } })`
* After `analyzeBoard(...)` returns, log:

  * `console.log('[WordVinder] Scrabble analysis response:', result)`

(Yes, analyzeBoard itself also logs—this is intentional redundancy for easier debugging from page context.)

### Result handling requirements

* If `result.ok` and `isScrabbleBoardState(result.board)`:

  * set `extractedScrabbleBoard`
  * advance steps to “Review extraction”
* If `result.ok` but NOT Scrabble schema:

  * treat as an error for this page:

    * show a friendly message: “This screenshot didn’t look like Scrabble. Try a clearer Scrabble board screenshot.”
    * log the board schema received
* If `!result.ok`:

  * show a friendly error message with whatever `result.error.message` exists

### UI requirements

* Page header similar to other pages:

  * eyebrow: “Scrabble Vinder”
  * h1: “Upload a Scrabble screenshot”
  * muted description: mention rack + board extraction
* Place upload card near top like Wordscapes
* Dialog should show:

  * Steps header
  * The active step content
  * If on “Review extraction”, render rack + board preview (Stage 4 builds dedicated components, but you can do a basic inline render in Stage 3 if needed and refactor in Stage 4)

2. Add: `src/features/scrabble/scrabble.css` (optional in Stage 3; can be Stage 5)

* If you need layout tweaks for board grid, feel free to add minimal CSS and import it into ScrabblePage.

## Acceptance Criteria

* Upload control appears on `/scrabble`
* Upload disabled if `difyPingStatus !== 'ok'`
* Upload triggers modal steps and calls API
* Console logs show payload metadata and response
* Scrabble schema is detected and stored when present

---

# Stage 4 — Scrabble UI Components: Rack + 15x15 Board Preview + Confirm Flow

## Goals

* Move board/rack rendering into small components.
* Implement a clean “Review extraction” step with:

  * Rack displayed as tiles (letter + optional blank indicator; points optional)
  * Board displayed as a 15x15 grid, showing letters where present
* Add explicit “Confirm” and “Cancel” buttons.
* On confirm: close dialog and keep extracted state visible on the page (below upload), so the user can see what was extracted.

## Files to Add / Change

1. Add: `src/features/scrabble/components/ScrabbleRack.tsx`
   Props:

* `rack: ScrabbleRackTile[]`
  Responsibilities:
* Render a horizontal list/grid of tiles
* For blank tiles (`isBlank: true` / `letter: null`), show something like “Blank”
* Optionally show points in a corner or muted text; do not over-style

2. Add: `src/features/scrabble/components/ScrabbleBoard.tsx`
   Props:

* `tiles: Array<Array<string | null>>`
* `size?: number` (default 15)
  Responsibilities:
* Render a 15x15 grid
* Each cell:

  * empty cell: blank background
  * letter cell: centered letter
* Add lightweight sanity checks:

  * If tiles not 15 rows or any row not 15 cols, show a small error message and log details

3. Update: `src/features/scrabble/pages/ScrabblePage.tsx`

* Replace inline rack/board rendering with these components.
* Confirm step:

  * `Confirm` button:

    * marks analysis complete
    * closes dialog
    * leaves extracted board on page
  * `Cancel` button:

    * closes dialog
    * clears extracted board (or keeps it but does not “commit”; choose one and be consistent—recommended: clear it to avoid implying user confirmed)

4. Optional: Add a “Re-analyze” button

* Same selectedScreenshot file triggers analysis again
* Keep it simple; you can skip retries unless you want parity with Wordscapes

## Acceptance Criteria

* Rack and board render via dedicated components
* Confirm/Cancel behavior is intuitive and consistent
* Extracted results remain visible on the page after confirm
* Bad tile dimensions fail gracefully (UI message + console.warn)

---

# Stage 5 — Polish: Styling, Edge Cases, and Consistency Pass

## Goals

* Make Scrabble page feel consistent with other pages.
* Improve error states and mobile layout.
* Ensure no TypeScript lint issues and no unused imports.

## Checklist

* Add/adjust `scrabble.css`:

  * Board grid should be usable on desktop and scrollable on mobile
  * Use `overflow: auto` for board container
  * Tile size should be reasonable (e.g., 24–32px) but don’t obsess—just make it readable
* Ensure imports match existing patterns (PrimeReact, FontAwesome optional)
* Ensure logging is present:

  * analyzeBoard request + response logs
  * ScrabblePage payload + response logs
* Ensure Wordscapes types were updated cleanly after Stage 2
* Confirm navigation and build are green

## Acceptance Criteria

* `/scrabble` looks and feels like the rest of the app
* Board preview is usable on mobile (scroll instead of breaking layout)
* No TS errors, no eslint unused-vars, no broken routes