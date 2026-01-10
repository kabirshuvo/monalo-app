export async function recordEvent(name: string, data: any) {
  return { recorded: true, name, data }
}
