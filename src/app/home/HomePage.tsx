import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'

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
          <p className="eyebrow">Word Vinder</p>
          <h1>Pick a helper to launch</h1>
          <p className="muted">
            Three solvers in one place: Wordle, Quartiles, and Wordscapes. Routes and PrimeReact
            styling are ready for feature work.
          </p>
        </div>
        <div className="header-tags">
          <Tag value="PrimeReact" icon="pi pi-prime" severity="info" />
          <Tag value="React Router" icon="pi pi-directions" severity="info" />
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
