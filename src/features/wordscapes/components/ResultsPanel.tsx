import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import type { WordFinderSubmission, WordGroup } from '../types'

type ResultsPanelProps = {
  submission: WordFinderSubmission | null
  results: WordGroup[]
}

function ResultsPanel({ submission, results }: ResultsPanelProps) {
  const hasSubmission = !!submission
  const hasResults = results.length > 0
  const totalCount = results.reduce((sum, group) => sum + group.words.length, 0)

  return (
    <Card className="wordscapes-card" title="Word results">
      {!hasSubmission && (
        <div className="wordscapes-placeholder">
          <Message severity="info" text="Possible words will appear here after you enter letters." />
          <ul className="placeholder-list">
            <li>Alphabetized matches when a length is chosen</li>
            <li>Grouped lists (3–8 letters) when no length is chosen</li>
            <li>Scrollable area for long lists</li>
          </ul>
        </div>
      )}

      {hasSubmission && submission && !hasResults && (
        <div className="wordscapes-empty" aria-live="polite">
          <Message severity="warn" text="No matches found for your letters." />
          <div className="results-summary">
            <div className="summary-row">
              <span className="summary-label">Target length:</span>
              <span className="summary-value">
                {submission.wordLength ? `${submission.wordLength} letters` : 'All (3–8)'}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Letters:</span>
              <div className="letters-chip-row">
                {submission.letters.map((letter, idx) => (
                  <Tag key={`${letter}-${idx}`} value={letter} severity="secondary" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasResults && (
        <div className="wordscapes-results" aria-live="polite">
          <div className="results-summary compact">
            <div className="summary-row">
              <span className="summary-label">Target length:</span>
              <span className="summary-value">
                {submission?.wordLength ? `${submission.wordLength} letters` : 'All (3–8)'}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total matches:</span>
              <Tag value={totalCount} severity="info" />
            </div>
          </div>
          <div className="results-scroll">
            {results.map((group) => (
              <div key={group.length} className="result-group">
                <div className="group-header">
                  <span className="group-length">{group.length}-letter words</span>
                  <Tag value={group.words.length} severity="info" />
                </div>
                <ul className="word-list">
                  {group.words.map((word) => (
                    <li key={word} className="word-list-item">
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default ResultsPanel
