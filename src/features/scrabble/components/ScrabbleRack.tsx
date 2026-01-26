import type { ScrabbleRackTile } from '../../../services/analyzeBoard'

type ScrabbleRackProps = {
  rack: ScrabbleRackTile[]
}

function ScrabbleRack({ rack }: ScrabbleRackProps) {
  if (!rack.length) {
    return <p className="muted">No rack tiles detected.</p>
  }

  return (
    <div className="scrabble-rack">
      {rack.map((tile, index) => (
        <div key={`scrabble-rack-${index}`} className="scrabble-rack-tile">
          <div className="scrabble-rack-letter">
            {tile.letter ?? (tile.isBlank ? 'Blank' : '-')}
          </div>
          <div className="scrabble-rack-points">{tile.points}</div>
        </div>
      ))}
    </div>
  )
}

export default ScrabbleRack
