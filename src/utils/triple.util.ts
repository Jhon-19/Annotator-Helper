import type { ITriple } from '@/views/types/triple.type'

export function checkTripleInSet(targetTriple: ITriple, tripleSet: ITriple[]) {
  let isSameTriple = false
  for (let triple of tripleSet) {
    isSameTriple =
      triple.headEntity === targetTriple.headEntity &&
      triple.relation === targetTriple.relation &&
      triple.tailEntity === targetTriple.tailEntity
  }
  return isSameTriple
}

export function shallowCopyTriple(oldTriple: ITriple, newTriple: ITriple) {
  Object.entries(oldTriple).forEach(([key, value]) => {
    newTriple[key as keyof ITriple] = value
  })
}
