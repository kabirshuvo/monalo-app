"use client"
import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  return (
    <main>
      <h1>Register</h1>
      <form>
        <label>Email: <input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <button type="submit">Create account</button>
      </form>
    </main>
  )
}
