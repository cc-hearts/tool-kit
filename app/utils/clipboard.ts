/** 写入剪贴板，空值静默忽略（配合工具页的复制按钮使用） */
export async function copyText(text: string) {
  if (text)
    await navigator.clipboard.writeText(text)
}
