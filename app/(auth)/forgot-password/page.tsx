"use client"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  return (
    <main>
      <h1>Forgot Password</h1>
      <form>
        <label>Email: <input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <button type="submit">Send reset link</button>
      </form>
    </main>
  )
}
