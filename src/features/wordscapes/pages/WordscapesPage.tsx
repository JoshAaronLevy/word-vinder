import { useEffect, useState } from 'react'
import { FileUpload } from 'primereact/fileupload'
import ResultsPanel from '../components/ResultsPanel'
import WordFinderForm from '../components/WordFinderForm'
import { findMatchingWords } from '../logic/wordSearch'
import type { WordFinderSubmission, WordGroup } from '../types'
import { getWordscapesWordsByLength } from '../../../shared/dictionary/englishWords'
import '../wordscapes.css'
import { analyzeBoard } from '../../../services/analyzeBoard'

function WordscapesPage() {
  const [submission, setSubmission] = useState<WordFinderSubmission | null>(null)
  const [results, setResults] = useState<WordGroup[]>([])
  const [wordsByLength, setWordsByLength] = useState<Record<number, string[]> | null>(null)
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(true)
  const [dictionaryError, setDictionaryError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    getWordscapesWordsByLength()
      .then((map) => {
        if (!isMounted) return
        setWordsByLength(map)
        setDictionaryError(null)
      })
      .catch((error: Error) => {
        if (!isMounted) return
        console.error(error)
        setWordsByLength(null)
        setDictionaryError('Unable to load dictionary data.')
      })
      .finally(() => {
        if (isMounted) {
          setIsDictionaryLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = (payload: WordFinderSubmission) => {
    setSubmission(payload)
    if (!wordsByLength) {
      setResults([])
      return
    }
    setResults(findMatchingWords(payload, wordsByLength))
  }

  const handleReset = () => {
    setSubmission(null)
    setResults([])
  }

  const handleScreenshotUpload = async (event: { files: File[] }) => {
    const [file] = event.files
    if (!file) return

    const imagePayload = {
      kind: 'wordvinder.screenshot.upload.v1',
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      },
    }

    console.log('[WordVinder] Selected screenshot file:', file)
    console.log('[WordVinder] Image payload:', imagePayload)

    try {
      const result = await analyzeBoard(file)
      console.log('[WordVinder] Board analysis response:', result)
    } catch (err) {
      console.warn('[WordVinder] Board analysis failed:', err)
    }
  }

  return (
    <section className="page wordscapes-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Wordscapes Vinder (Finder)</p>
          <h1>Filter words by letters and length</h1>
          <p className="muted">
            Choose 4–7 letters, optionally pick target word lengths, and instantly see valid matches
            grouped by length.
          </p>
        </div>
      </div>

      <div className="wordscapes-layout">
        <div className="wordscapes-column">
          <div className="wordscapes-upload">
            <FileUpload
              mode="basic"
              customUpload
              uploadHandler={handleScreenshotUpload}
              chooseLabel="Upload Screenshot"
              auto
              multiple={false}
              className="p-button-lg"
            />
          </div>
          <WordFinderForm
            onSubmit={handleSubmit}
            onReset={handleReset}
            isDictionaryReady={!!wordsByLength && !isDictionaryLoading && !dictionaryError}
          />
        </div>
        <div className="wordscapes-column">
          <ResultsPanel
            submission={submission}
            results={results}
            isDictionaryLoading={isDictionaryLoading}
            dictionaryError={dictionaryError}
          />
        </div>
      </div>
    </section>
  )
}

export default WordscapesPage
