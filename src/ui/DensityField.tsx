import * as React from 'react'
import { Density } from '../common/Density'

interface Props {
  densities: Set<Density>
  className?: string
  onChange: (densities: Set<Density>) => void
}

export class DensityField extends React.Component<Props, {}> {

  onSelectionChange(density: Density): void {
    const densities = this.props.densities
    if (densities.has(density)) {
      densities.delete(density)
    } else {
      densities.add(density)
    }
    this.props.onChange(densities)
  }

  render() {
    const { densities, className } = this.props
    return (
      <div className={className}>
        <label className="active">Densities</label>

        {Density.densities.map(density =>
          <p key={`density-${density.name}`}>
            <label>
              <input
                className="filled-in"
                type="checkbox"
                checked={densities.has(density)}
                onChange={() => this.onSelectionChange(density)}
                />
              <span>{density.name} (x{density.scale})</span>
            </label>
          </p>
        )}
      </div>
    )
  }
}
