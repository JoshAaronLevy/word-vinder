export type LetterState = 'correct' | 'present' | 'absent'

export type LetterSlot = {
  letter: string
  state: LetterState
}

export type Attempt = {
  letters: LetterSlot[]
}
