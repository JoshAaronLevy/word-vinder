import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import type { Attempt } from '../types'

type AttemptsPanelProps = {
  attempts: Attempt[]
  onReset: () => void
  maxAttempts: number
}

const stateSeverity: Record<string, 'success' | 'warning' | 'secondary'> = {
  correct: 'success',
  present: 'warning',
  absent: 'secondary',
}

function AttemptsPanel({ attempts, onReset, maxAttempts }: AttemptsPanelProps) {
  const remaining = Math.max(0, maxAttempts - attempts.length)

  return (
    <Card
      className="wordle-card"
      title="Your attempts"
      subTitle={`${attempts.length}/${maxAttempts} entered`}
    >
      <div className="attempts-list">
        {attempts.length === 0 && <p className="muted">No attempts yet. Enter a row to begin.</p>}

        {attempts.map((attempt, idx) => (
          <div key={idx} className="attempt-row">
            {attempt.letters.map((slot, letterIdx) => (
              <Tag
                key={`${idx}-${letterIdx}`}
                value={slot.letter.toUpperCase()}
                severity={stateSeverity[slot.state]}
                className="attempt-tag"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="attempts-footer">
        <span className="muted">Remaining rows: {remaining}</span>
        <Button
          type="button"
          label="Reset attempts"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          onClick={onReset}
          disabled={!attempts.length}
        />
      </div>
    </Card>
  )
}

export default AttemptsPanel
