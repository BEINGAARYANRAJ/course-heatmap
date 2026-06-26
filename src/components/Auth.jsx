import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  async function handle() {
    setError('')
    const fn = isLogin
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    if (error) setError(error.message)
    else onLogin()
  }

  return (
    <div className="auth-box">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {error && <p className="error">{error}</p>}
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className="submit-btn" onClick={handle}>
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
      <p style={{marginTop:'1rem', fontSize:'0.9rem', color:'#666'}}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span style={{color:'#639922', cursor:'pointer'}} onClick={() => setIsLogin(f => !f)}>
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  )
}