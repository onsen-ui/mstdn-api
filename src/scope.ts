type Scope = 'read' | 'write' | 'follow'
namespace Scope {
  export const READ: Scope = 'read'
  export const WRITE: Scope = 'write'
  export const FOLLOW: Scope = 'follow'
  export const DEFAULT: Scope[] = [Scope.READ, Scope.WRITE, Scope.FOLLOW]
  /**
   * if x is not Scope, return null
   */
  export function from (x: any): Scope | null {
    let result: Scope | null = null
    for (const scope of [Scope.READ, Scope.WRITE, Scope.FOLLOW]) {
      if (x === scope) {
        result = scope
        break
      }
    }
    return result
  }
  export function parse (str: string): Scope[] {
    const arr = str.split(' ').map(from).filter(x => x) as Scope[]
    return arr
  }
}

export default Scope
