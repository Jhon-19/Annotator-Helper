export function checkPunctuation(str: string) {
  const reg = /[，。；;,!?]/g
  return reg.test(str)
}
