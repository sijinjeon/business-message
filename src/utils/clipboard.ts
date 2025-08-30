/**
 * 클립보드에서 텍스트를 읽어옵니다
 */
export async function readClipboard(): Promise<string> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('클립보드 접근이 지원되지 않습니다.')
    }
    
    const text = await navigator.clipboard.readText()
    return text.trim()
  } catch (error) {
    console.error('Clipboard read error:', error)
    return ''
  }
}

/**
 * 클립보드에 텍스트를 복사합니다
 */
export async function writeClipboard(text: string): Promise<void> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('클립보드 접근이 지원되지 않습니다.')
    }
    
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Clipboard write error:', error)
    throw new Error('클립보드 복사에 실패했습니다.')
  }
}
