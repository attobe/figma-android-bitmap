import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Density } from './Density'
import './ui.css'

interface State {
  densities: Set<Density>
}

class App extends React.Component<{}, State> {

  constructor(props) {
    super(props)

    this.state = {
      densities: new Set(Density.densities.filter(density => density.isFamous))
    }
  }

  onCreate = () => {
    const count = 5
    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
  }

  onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  onDensityChanged(density: Density): void {
    const densities = this.state.densities
    if (densities.has(density)) {
      densities.delete(density)
    } else {
      densities.add(density)
    }
    this.setState({ densities: densities })
  }

  render() {
    return (
      <div>
        <section className="section">
          <div className="field">
            <h3 className="legend">Densities</h3>

            <div className="input-checkbox-list">
              {Density.densities.map((density) =>
                <label key={`density-${density.name}`} className="input-checkbox-label">
                  <input
                    className="input-checkbox"
                    type="checkbox"
                    checked={this.state.densities.has(density)}
                    onChange={(event) => this.onDensityChanged(density)}
                    />
                  <span className="input-checkbox-text">{density.name} (x{density.scale})</span>
                </label>
              )}
            </div>
          </div>

          <div className="field">
            <h3 className="legend">Directory Name</h3>

            <input
              className="input-text"
              type="text"
              placeholder="drawable-{}"
              />

            <p className="hint">
              Specify directory name format; such as <code>drawable-ja-{'{}'}-v29</code>.<br />
              <code>{'{}'}</code> will be replaced with densities.
            </p>
          </div>
        </section>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
