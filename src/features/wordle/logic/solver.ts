import words from 'an-array-of-english-words'
import type { Attempt, LetterState } from '../types'

const WORD_LENGTH = 5
const BASE_LIST = (words as string[])
  .filter((word) => word.length === WORD_LENGTH && /^[a-zA-Z]+$/.test(word))
  .map((word) => word.toLowerCase())

const isPositiveState = (state: LetterState) => state === 'correct' || state === 'present'

export function suggestWords(attempts: Attempt[]): string[] {
  if (!attempts.length) return BASE_LIST

  return BASE_LIST.filter((candidate) =>
    attempts.every((attempt) =>
      attempt.letters.every((slot, index) => {
        const letter = slot.letter.toLowerCase()
        const currentChar = candidate[index]

        if (!letter || letter.length !== 1) {
          return true
        }

        switch (slot.state) {
          case 'correct':
            return letter === currentChar
          case 'present':
            return letter !== currentChar && candidate.includes(letter)
          case 'absent': {
            if (!candidate.includes(letter)) return true

            const markedElsewhere = attempt.letters.some(
              (other, otherIndex) =>
                otherIndex !== index &&
                other.letter.toLowerCase() === letter &&
                isPositiveState(other.state),
            )

            return markedElsewhere
          }
          default:
            return true
        }
      }),
    ),
  )
}
