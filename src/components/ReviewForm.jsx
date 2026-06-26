import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ReviewForm({ courses, onSubmit }) {
  const [form, setForm] = useState({
    course_id: '',
    professor_rating: 3,
    workload_rating: 3,
    attendance_required: false,
    grade: 'A',
    comment: ''
  })
  const [submitted, setSubmitted] = useState(false)

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit() {
    if (!form.course_id) return alert('Please select a course')

    const { data: { user } } = await supabase.auth.getUser()

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('course_id', form.course_id)
      .eq('user_id', user.id)

    if (existing && existing.length > 0) {
      return alert('You already reviewed this course!')
    }

    const { error } = await supabase.from('reviews').insert([{
      ...form,
      user_id: user.id,
      professor_rating: parseFloat(form.professor_rating),
      workload_rating: parseFloat(form.workload_rating)
    }])

    if (!error) { setSubmitted(true); onSubmit() }
    else alert('Error submitting: ' + error.message)
  }

  if (submitted) return (
    <div className="success-msg">
      Review submitted! <button onClick={() => setSubmitted(false)}>Add another</button>
    </div>
  )

  return (
    <div className="review-form">
      <h2>Submit a Review</h2>

      <div className="form-group">
        <label>Course</label>
        <select name="course_id" value={form.course_id} onChange={handle}>
          <option value="">-- Select Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Professor Rating: <strong>{form.professor_rating}</strong> / 5</label>
        <input type="range" name="professor_rating" min="1" max="5" step="0.1"
          value={form.professor_rating} onChange={handle} />
      </div>

      <div className="form-group">
        <label>Workload Rating: <strong>{form.workload_rating}</strong> / 5</label>
        <input type="range" name="workload_rating" min="1" max="5" step="0.1"
          value={form.workload_rating} onChange={handle} />
      </div>

      <div className="form-group">
        <label>Grade Received</label>
        <select name="grade" value={form.grade} onChange={handle}>
          {['A','B','C','D','F'].map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="form-group checkbox">
        <label>
          <input type="checkbox" name="attendance_required"
            checked={form.attendance_required} onChange={handle} />
          Attendance Required
        </label>
      </div>

      <div className="form-group">
        <label>Comment (optional)</label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handle}
          placeholder="Share your experience with this course..."
          rows={3}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1.5px solid #ddd',
            fontSize: '0.95rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
      </div>

      <button className="submit-btn" onClick={submit}>Submit Review</button>
    </div>
  )
}