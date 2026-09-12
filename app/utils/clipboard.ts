/**
 * 同步兜底：clipboard API 在非安全上下文 / 权限被拒时不可用，
 * 退回 execCommand 复制（与 antdv-next 内置 copy 工具的行为保持一致）。
 */
function execCopy(text: string): boolean {
  let copied = false
  const onCopy = (event: ClipboardEvent) => {
    event.stopPropagation()
    event.preventDefault()
    event.clipboardData?.setData('text/plain', text)
    copied = true
  }

  try {
    document.addEventListener('copy', onCopy, { capture: true })
    document.execCommand('copy')
    return copied
  }
  catch {
    return false
  }
  finally {
    document.removeEventListener('copy', onCopy, { capture: true })
  }
}

/**
 * 复制文本到剪贴板，返回是否成功。
 * 不抛异常，交由调用方决定提示文案，
 * 避免未处理的 Promise rejection 中断后续反馈逻辑。
 */
export async function copyText(text: string): Promise<boolean> {
  if (!text)
    return false

  try {
    await navigator.clipboard.writeText(text)
    return true
  }
  catch {
    return execCopy(text)
  }
}
