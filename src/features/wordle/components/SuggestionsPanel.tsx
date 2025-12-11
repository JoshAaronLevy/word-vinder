import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'

type SuggestionsPanelProps = {
  suggestions: string[]
}

function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  const count = suggestions.length

  return (
    <Card className="wordle-card" title="Possible words">
      <div className="suggestions-summary">
        <Tag value={`${count} matches`} severity="info" />
      </div>

      {count === 0 ? (
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
