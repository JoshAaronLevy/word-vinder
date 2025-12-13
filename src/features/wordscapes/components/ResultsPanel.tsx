import { useMemo, useState } from 'react'
import { Accordion, AccordionTab } from 'primereact/accordion'
import type { AccordionTabChangeEvent } from 'primereact/accordion'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import type { WordFinderSubmission, WordGroup } from '../types'

type ResultsPanelProps = {
  submission: WordFinderSubmission | null
  results: WordGroup[]
  isDictionaryLoading: boolean
  dictionaryError: string | null
}

function ResultsPanel({ submission, results, isDictionaryLoading, dictionaryError }: ResultsPanelProps) {
  const hasSubmission = !!submission
  const hasResults = results.length > 0
  const totalCount = results.reduce((sum, group) => sum + group.words.length, 0)
  const resultsSignature = useMemo(() => {
    if (!results.length) return 'empty'
    return results.map((group) => `${group.length}:${group.words.join('|')}`).join(';')
  }, [results])

  const defaultActiveIndex = useMemo(() => {
    if (!hasResults) return null
    let smallestIndex = 0
    let smallestLength = results[0].length
    for (let index = 1; index < results.length; index += 1) {
      if (results[index].length < smallestLength) {
        smallestLength = results[index].length
        smallestIndex = index
      }
    }
    return smallestIndex
  }, [hasResults, results])

  const [selection, setSelection] = useState<{ index: number | null; signature: string }>({
    index: null,
    signature: '',
  })

  const activeIndex =
    selection.signature === resultsSignature
      ? selection.index ?? defaultActiveIndex
      : defaultActiveIndex

  const handleAccordionChange = (event: AccordionTabChangeEvent) => {
    const nextIndex = Array.isArray(event.index) ? event.index[0] : event.index
    setSelection({
      index: typeof nextIndex === 'number' ? nextIndex : null,
      signature: resultsSignature,
    })
  }

  const describeTargetLengths = () => {
    if (!submission?.wordLengths?.length) return 'All (3–8)'
    const lengths = [...submission.wordLengths].sort((a, b) => a - b)
    if (lengths.length === 1) return `${lengths[0]} letters`
    if (lengths.length === 2) return `${lengths[0]} & ${lengths[1]} letters`
    return `${lengths.slice(0, -1).join(', ')} & ${lengths[lengths.length - 1]} letters`
  }

  return (
    <Card className="wordscapes-card" title="Word results">
      {dictionaryError ? (
        <Message severity="error" text={dictionaryError} />
      ) : isDictionaryLoading ? (
        <Message severity="info" text="Loading dictionary data..." />
      ) : (
        <>
          {!hasSubmission && (
            <div className="wordscapes-placeholder">
              <Message severity="info" text="Possible words will appear here after you enter letters." />
              <ul className="placeholder-list">
                <li>Alphabetized matches grouped by word length</li>
                <li>Filter to specific lengths or view all 3–8 letter words</li>
              </ul>
            </div>
          )}

          {hasSubmission && submission && !hasResults && (
            <div className="wordscapes-empty" aria-live="polite">
              <Message severity="warn" text="No matches found for your letters." />
              <div className="results-summary">
                <div className="summary-row">
                  <span className="summary-label">Target lengths:</span>
                  <span className="summary-value">{describeTargetLengths()}</span>
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
                  <span className="summary-label">Target lengths:</span>
                  <span className="summary-value">{describeTargetLengths()}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Total matches:</span>
                  <Tag value={totalCount} severity="info" />
                </div>
              </div>
              <div className="results-scroll">
                <Accordion activeIndex={activeIndex} onTabChange={handleAccordionChange}>
                  {results.map((group) => (
                    <AccordionTab
                      key={group.length}
                      header={`${group.length}-letter words - ${group.words.length}`}
                    >
                      <ul className="word-list">
                        {group.words.map((word) => (
                          <li key={word} className="word-list-item">
                            {word}
                          </li>
                        ))}
                      </ul>
                    </AccordionTab>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export default ResultsPanel
