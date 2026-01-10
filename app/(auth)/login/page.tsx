"use client"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  return (
    <main>
      <h1>Login</h1>
      <form>
        <label>Email: <input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  )
}
