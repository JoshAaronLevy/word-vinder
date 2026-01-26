type ScrabbleBoardProps = {
  tiles: Array<Array<string | null>>
  size?: number
}

function ScrabbleBoard({ tiles, size = 15 }: ScrabbleBoardProps) {
  const rowsValid = Array.isArray(tiles) && tiles.length === size
  const colsValid = rowsValid && tiles.every((row) => Array.isArray(row) && row.length === size)
  const isValid = rowsValid && colsValid

  if (!isValid) {
    console.warn('[WordVinder] Scrabble board dimensions invalid:', {
      expectedSize: size,
      rows: Array.isArray(tiles) ? tiles.length : null,
      cols: Array.isArray(tiles) ? tiles.map((row) => (Array.isArray(row) ? row.length : null)) : null,
    })

    return <p className="muted">Board data is not a {size}x{size} grid.</p>
  }

  return (
    <div className="scrabble-board" style={{ gridTemplateColumns: `repeat(${size}, 28px)` }}>
      {tiles.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`scrabble-cell-${rowIndex}-${colIndex}`}
            className={`scrabble-board-cell${cell ? ' scrabble-board-cell--filled' : ''}`}
          >
            {cell ?? ''}
          </div>
        ))
      )}
    </div>
  )
}

export default ScrabbleBoard
