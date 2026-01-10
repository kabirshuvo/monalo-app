export async function sendNotification(to: string, payload: any) {
  return { ok: true, to, payload }
}
