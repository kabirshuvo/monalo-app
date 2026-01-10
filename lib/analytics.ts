export async function recordEvent(name: string, data: unknown) {
  return { recorded: true, name, data }
}
