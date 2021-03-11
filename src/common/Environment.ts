export function isSandbox(): boolean {
  return typeof figma !== 'undefined'
}
