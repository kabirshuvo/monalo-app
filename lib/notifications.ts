export async function sendNotification(to: string, payload: unknown) {
  return { ok: true, to, payload }
}
