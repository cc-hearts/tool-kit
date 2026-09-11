/**
 * 埋点示例：接收客户端行为上报。
 * word-translation 工具在复制结果时会调用该路由，后续可在此接入数据库或日志服务。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ type?: string }>(event).catch(() => null)

  if (body?.type) {
    // TODO: 接入真实的埋点存储（数据库 / 日志服务）
  }

  return { code: 200, message: 'ok' }
})
