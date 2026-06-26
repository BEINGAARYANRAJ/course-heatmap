import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CourseForm({ onSubmit }) {

  const [form, setForm] = useState({
    course_code: '',
    course_name: '',
    professor: '',
    semester: 'Fall 2024',
    credits: 3,
    department: 'Computer Science'
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handle(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function submit() {
    if (!form.course_code || !form.course_name || !form.professor) {
      return setError('Please fill all fields')
    }

    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('course_code', form.course_code)
      .eq('professor', form.professor)
      .eq('semester', form.semester)

    if (existing && existing.length > 0) {
      return setError('This course with this professor already exists!')
    }

    const { error } = await supabase.from('courses').insert([{
      ...form,
      credits: parseInt(form.credits)
    }])

    if (error) setError(error.message)
    else { setSubmitted(true); onSubmit() }
  }

  if (submitted) return (
    <div className="success-msg">
      Course added!
      <button onClick={() => setForm({
        course_code: '', course_name: '', professor: '',
        semester: 'Fall 2024', credits: 3, department: 'Computer Science'
      })}>Add another</button>
    </div>
  )

  return (
    <div className="review-form">
      <h2>Add New Course</h2>
      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Course Code (e.g. CS101)</label>
        <input name="course_code" value={form.course_code} onChange={handle} placeholder="CS101" />
      </div>

      <div className="form-group">
        <label>Course Name</label>
        <input name="course_name" value={form.course_name} onChange={handle} placeholder="Introduction to CS" />
      </div>

      <div className="form-group">
        <label>Professor Name</label>
        <input name="professor" value={form.professor} onChange={handle} placeholder="Dr. Smith" />
      </div>

      <div className="form-group">
        <label>Semester</label>
        <select name="semester" value={form.semester} onChange={handle}>
          <option>Fall 2024</option>
          <option>Spring 2024</option>
          <option>Fall 2023</option>
        </select>
      </div>

      <div className="form-group">
        <label>Department</label>
        <select name="department" value={form.department} onChange={handle}>
          <option>Computer Science</option>
          <option>Mathematics</option>
          <option>Physics</option>
          <option>Chemistry</option>
          <option>Biology</option>
          <option>Economics</option>
          <option>General</option>
        </select>
      </div>

      <div className="form-group">
        <label>Credits</label>
        <select name="credits" value={form.credits} onChange={handle}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>
      </div>

      <button className="submit-btn" onClick={submit}>Add Course</button>
    </div>
  )
}