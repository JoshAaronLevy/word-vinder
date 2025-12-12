import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'

type SuggestionsPanelProps = {
  suggestions: string[]
  hasAttempts: boolean
}

function SuggestionsPanel({ suggestions, hasAttempts }: SuggestionsPanelProps) {
  const count = suggestions.length
  const hasMatches = count > 0
  console.log("suggestions: ", suggestions)

  return (
    <Card className="wordle-card" title="Possible words">
      {hasAttempts && (
        <div className="suggestions-summary">
          <Tag value={`${count} matches`} severity="info" />
        </div>
      )}

      {!hasAttempts ? (
        <Message
          severity="info"
          text="Enter at least one attempt to generate possible matches."
        />
      ) : !hasMatches ? (
        <Message
          severity="warn"
          text="No matches yet. Add or adjust attempts to refine suggestions."
        />
      ) : (
        <div className="suggestions-grid" aria-live="polite">
          {suggestions.map((word) => (
            <span key={word} className="suggestion-pill">
              {word.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

export default SuggestionsPanel
