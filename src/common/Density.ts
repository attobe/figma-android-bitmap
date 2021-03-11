export class Density {
  static ldpi: Density = new Density('ldpi', 0.75, false)
  static mdpi: Density = new Density('mdpi', 1, true)
  static hdpi: Density = new Density('hdpi', 1.5, true)
  static xhdpi: Density = new Density('xhdpi', 2, true)
  static xxhdpi: Density = new Density('xxhdpi', 3, true)
  static xxxhdpi: Density = new Density('xxxhdpi', 4, true)

  static readonly densities: Density[] = [
    Density.ldpi, Density.mdpi, Density.hdpi,
    Density.xhdpi, Density.xxhdpi, Density.xxxhdpi
  ]

  constructor(
    readonly name: string,
    readonly scale: number,
    readonly isFamous: boolean) {}

  static densityOf(name: string): Density {
    return Density.densities.find(density => density.name === name)
  }
}
