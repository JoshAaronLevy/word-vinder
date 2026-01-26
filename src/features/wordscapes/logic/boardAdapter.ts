import type { WordscapesBoardState } from '../../../services/analyzeBoard'
import type { WordFinderSubmission, WordGroup } from '../types'

const normalizeToken = (value: string) => value.trim().toUpperCase()

export type ConfirmBoardState = {
  letters: string[]
  missingByLength: Array<{ length: number; count: number | null }>
}

export const getTargetWordLengths = (missingByLength: WordscapesBoardState['missingByLength']) => {
  const lengths = missingByLength
    .filter((slot) => Number.isFinite(slot.length) && slot.length > 0 && typeof slot.count === 'number' && slot.count > 0)
    .map((slot) => slot.length)

  const unique = Array.from(new Set(lengths))
  unique.sort((a, b) => a - b)
  return unique
}

export const flattenSolvedWordsByLength = (entries?: WordscapesBoardState['solvedWordsByLength']) => {
  if (!Array.isArray(entries)) return []
  const words: string[] = []
  for (const entry of entries) {
    if (!entry || !Array.isArray(entry.words)) continue
    for (const word of entry.words) {
      if (typeof word === 'string' && word.trim()) {
        words.push(word)
      }
    }
  }
  return words
}

export const getSolvedWordsFromBoard = (board: WordscapesBoardState) =>
  flattenSolvedWordsByLength(board.solvedWordsByLength)

export const mapBoardToSubmission = (board: WordscapesBoardState): WordFinderSubmission => {
  const letters = board.letters.map(normalizeToken).filter(Boolean)
  const wordLengths = getTargetWordLengths(board.missingByLength ?? [])

  return {
    letters,
    letterCount: letters.length,
    wordLengths: wordLengths.length ? wordLengths : undefined,
  }
}

export const normalizeConfirmStateFromBoard = (board: WordscapesBoardState): ConfirmBoardState => ({
  letters: [...board.letters],
  missingByLength: board.missingByLength.map((entry) => ({ ...entry })),
})

export const confirmStateToSubmission = (state: ConfirmBoardState): WordFinderSubmission => {
  const letters = state.letters.map(normalizeToken).filter(Boolean)
  const wordLengths = getTargetWordLengths(state.missingByLength ?? [])

  return {
    letters,
    letterCount: letters.length,
    wordLengths: wordLengths.length ? wordLengths : undefined,
  }
}

export const filterSolvedWords = (groups: WordGroup[], solvedWords: string[]): WordGroup[] => {
  if (!solvedWords.length) return groups

  const solvedSet = new Set(solvedWords.map(normalizeToken).filter(Boolean))
  if (!solvedSet.size) return groups

  return groups.reduce<WordGroup[]>((acc, group) => {
    const words = group.words.filter((word) => !solvedSet.has(word.toUpperCase()))
    if (words.length) {
      acc.push({ ...group, words })
    }
    return acc
  }, [])
}
