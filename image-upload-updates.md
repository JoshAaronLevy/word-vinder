# image-upload-updates.md

## Overview

Add a **Confirmation Step** to the screenshot-analysis dialog:

1. Validate / compress image
2. Call API / Dify extraction
3. **Confirmation step (new)**: show screenshot thumbnail + prefilled editable form
4. Find dictionary matches
5. Complete / auto-close

The confirmation form:

* Inline row of letter inputs (no “choose letter count” dropdown)
* Editable “missingByLength” rows (length + count)
* Footer buttons: **Cancel**, **Re-Analyze**, **Confirm**
* Confirm is the only way to proceed to dictionary analysis

---

## Stage 0 — Prep + types + adapters (small, safe refactor)

### Goal

Make sure the UI can consume the **new server response shape** (V4) and convert it into what the existing solver expects.

### Tasks

1. **Confirm the analyzeBoard() response contract** and update types if needed:

   * Old code references `result.board.solvedWords` and `result.board.unsolvedSlots` in logging. That’s likely stale with your new V4 board shape. 
2. Update/extend `boardAdapter` logic:

   * Ensure you can derive:

     * `letters[]`
     * a “target word lengths” array for dictionary search (likely `length`s where `count > 0`)
     * a flat list of solved words for filtering (derived from `solvedWordsByLength` if present)
3. Add a new helper shape for confirmation step state, e.g.

   * `ConfirmBoardState = { letters: string[]; missingByLength: Array<{length:number; count:number|null}> }`
4. Add a mapping:

   * `confirmStateToSubmission(confirmState) => WordFinderSubmission`

     * `letters`
     * `letterCount = letters.length`
     * `wordLengths = missingByLength.filter(c>0).map(length)` (or `undefined` if none)

### Acceptance criteria

* You can take a V4 board response and produce a valid `WordFinderSubmission` without touching UI steps yet.
* Existing manual form flow still works unchanged.

---

## Stage 1 — Insert confirmation step into modal flow

### Goal

Stop the “auto-run suggestions immediately after analysis.” Instead, pause on confirmation UI.

### Tasks

1. Update step model in `WordscapesPage.tsx`:

   * Increase `stepCount` and add a new step summary like:

     * “Confirm Board State” between “Analyzing Board State” and “Identifying Possible Words”
2. Update `runImageAnalysis()` control flow:

   * After `analyzeBoard(uploadFile)` succeeds:

     * Store extracted board in state (raw + normalized confirm defaults)
     * Mark analysis step complete
     * Move to confirmation step index
     * **DO NOT** run suggestions yet
     * **DO NOT** auto-dismiss dialog yet
3. Add state:

   * `extractedBoard` (raw from API)
   * `confirmState` (editable local form state)
   * `confirmDirty` (optional) or simply track validity
   * `confirming` / `reAnalyzing` flags (optional)

### Acceptance criteria

* Uploading a screenshot now brings you to the confirmation step after analysis.
* No suggestions are computed until user confirms.

---

## Stage 2 — Build confirmation UI (thumbnail + inline form)

### Goal

Implement the new confirmation step UI inside the existing `Dialog`.

### Tasks

1. In `WordscapesPage.tsx` dialog body, render step-specific content:

   * For steps 0/1 show a simple “working…” message (or just keep current)
   * For **confirmation step**, render:

     * Thumbnail preview using existing `screenshotPreviewUrl` and PrimeReact `Image preview` (you already use this pattern outside the dialog) 
     * Inline row of letter inputs:

       * `letters.map((val, i) => <InputText maxLength={1} ... />)`
       * Use `toAlphaUpper` style logic or a local helper (you already have similar normalization in `WordFinderForm.tsx`) 
     * Editable missing-by-length list:

       * Render each row with:

         * `length` dropdown (3–12)
         * `count` dropdown or numeric input (0–20, allow blank -> null)
       * Add small “Add length” and “Remove” controls (optional but highly recommended)
2. Add validation rules for enabling Confirm:

   * Letters length 4–7 (or 5–8 if you want to mirror Dify—pick one and enforce consistently)
   * Each letter is exactly one A–Z
   * missingByLength rows:

     * `length` unique
     * `count` is `null` or 0–20
3. Visual feedback:

   * If invalid, show a small `Message severity="warn"` above the Confirm button.

### Acceptance criteria

* Confirmation step displays thumbnail + editable letters + editable missingByLength.
* Confirm button is disabled until minimal validation passes.

---

## Stage 3 — Footer buttons + control flow

### Goal

Add Cancel / Re-Analyze / Confirm behavior.

### Tasks

1. **Footer visible only on confirmation step**:

   * Cancel: open a confirmation dialog, then close the analysis dialog and reset transient state
   * Re-Analyze: rerun `runImageAnalysis(selectedScreenshot, { resetResults:true })`

     * keep same screenshot
     * reset confirm state + extracted board before re-running
   * Confirm:

     * Build `WordFinderSubmission` from `confirmState`
     * Compute dictionary suggestions (`runSuggestions`)
     * Mark suggestion step complete
     * Move to “Complete” step
     * Auto-dismiss after short delay (keep your existing “complete then close” behavior)
2. Cancel confirm dialog:

   * Use PrimeReact `ConfirmDialog` / `confirmDialog` (lightweight)
3. Ensure “Re-Analyze” respects retry limits (you already have retry attempts logic) 

   * In modal footer, you may bypass “retry limit” or reuse it—your call. I’d reuse it for consistency.

### Acceptance criteria

* Cancel closes dialog and resets state.
* Re-Analyze resubmits and returns to confirmation step with updated prefill.
* Confirm triggers suggestions and completes flow.

---

## Stage 4 — Polish + integration cleanup

### Goal

Make the UX feel intentional and remove stale references.

### Tasks

1. Ensure logs refer to the new fields (`missingByLength`, etc.)
2. Ensure `ResultsPanel` behavior remains correct after confirmation flow
3. Make sure object URLs are revoked (already done)
4. Add light CSS tweaks for confirmation form layout (keep it compact)

### Acceptance criteria

* No console errors.
* End-to-end flow feels smooth.
* Manual mode still works.