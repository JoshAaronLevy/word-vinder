import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'

const helpers = [
  {
    key: 'wordle',
    title: 'Wordle',
    description: 'Enter your attempts and tile states to narrow down 5-letter answers.',
    path: '/wordle',
  },
  {
    key: 'quartiles',
    title: 'Quartiles',
    description: 'Select tiles, generate 2–4 letter combinations, and page through results.',
    path: '/quartiles',
  },
  {
    key: 'wordscapes',
    title: 'Wordscapes',
    description: 'Enter 4–8 letters and an optional length to find valid words fast.',
    path: '/wordscapes',
  },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">The Ultimate Word Game Assistant</p>
          <h1>Game Type</h1>
          <p className="muted">
            Select a game type in order to launch the word finder for that game.
          </p>
        </div>
      </div>

      <div className="tile-grid">
        {helpers.map((helper) => (
          <Card key={helper.key} className="tile-card" title={helper.title}>
            <p className="muted">{helper.description}</p>
            <div className="tile-footer">
              <Button
                label="Open"
                icon="pi pi-arrow-right"
                onClick={() => navigate(helper.path)}
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default HomePage
