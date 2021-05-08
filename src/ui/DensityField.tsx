import * as React from 'react'
import { Density } from '../common/Density'

interface Props {
  densities: Set<Density>
  className: string|null
  onChange: (densities: Set<Density>) => void
}

export class DensityField extends React.Component<Props, {}> {
  private hasChanges = false

  onSelectionChange(density: Density): void {
    this.hasChanges = true
    const densities = this.props.densities
    if (densities.has(density)) {
      densities.delete(density)
    } else {
      densities.add(density)
    }
    this.props.onChange(densities)
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.densities !== nextProps.densities
      || this.props.className !== this.props.className
      || this.props.onChange !== this.props.onChange
      || this.hasChanges
  }

  componentDidUpdate() {
    this.hasChanges = false
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
