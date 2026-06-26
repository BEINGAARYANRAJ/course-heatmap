import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function CourseComparison({ courses, reviews, onClose }) {
  const [course1, setCourse1] = useState('')
  const [course2, setCourse2] = useState('')

  function getStats(courseId) {
    const course = courses.find(c => c.id === courseId)
    const courseReviews = reviews.filter(r => r.course_id === courseId)
    if (!course || courseReviews.length === 0) return null

    const avgRating = (courseReviews.reduce((s, r) => s + (r.professor_rating || 0), 0) / courseReviews.length).toFixed(1)
    const avgWorkload = (courseReviews.reduce((s, r) => s + (r.workload_rating || 0), 0) / courseReviews.length).toFixed(1)
    const attendance = courseReviews.filter(r => r.attendance_required).length
    const grades = ['A','B','C','D','F'].map(g => courseReviews.filter(r => r.grade === g).length)

    return { course, avgRating, avgWorkload, attendance, grades, total: courseReviews.length }
  }

  const stats1 = course1 ? getStats(course1) : null
  const stats2 = course2 ? getStats(course2) : null

  const barData = {
    labels: ['Professor Rating', 'Workload'],
    datasets: [
      stats1 ? {
        label: stats1.course.course_code,
        data: [parseFloat(stats1.avgRating), parseFloat(stats1.avgWorkload)],
        backgroundColor: 'rgba(99, 153, 34, 0.8)',
        borderRadius: 8
      } : { label: 'Course 1', data: [0, 0] },
      stats2 ? {
        label: stats2.course.course_code,
        data: [parseFloat(stats2.avgRating), parseFloat(stats2.avgWorkload)],
        backgroundColor: 'rgba(24, 95, 165, 0.8)',
        borderRadius: 8
      } : { label: 'Course 2', data: [0, 0] }
    ]
  }

  const barOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 5, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  }

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      stats1 ? {
        label: stats1.course.course_code,
        data: stats1.grades,
        backgroundColor: 'rgba(99, 153, 34, 0.8)',
        borderRadius: 6
      } : { label: 'Course 1', data: [0,0,0,0,0] },
      stats2 ? {
        label: stats2.course.course_code,
        data: stats2.grades,
        backgroundColor: 'rgba(24, 95, 165, 0.8)',
        borderRadius: 6
      } : { label: 'Course 2', data: [0,0,0,0,0] }
    ]
  }

  return (
    <div className="profile-overlay">
      <div className="profile-box">
        <div className="profile-header">
          <h2 style={{border:'none', padding:0, margin:0}}>Compare Courses</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
          <div className="form-group">
            <label>Course 1</label>
            <select value={course1} onChange={e => setCourse1(e.target.value)}>
              <option value="">-- Select --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Course 2</label>
            <select value={course2} onChange={e => setCourse2(e.target.value)}>
              <option value="">-- Select --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
              ))}
            </select>
          </div>
        </div>

        {(stats1 || stats2) && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
              {[stats1, stats2].map((s, i) => s && (
                <div key={i} style={{background:'#f7f9fc', borderRadius:'12px', padding:'1rem'}}>
                  <h3 style={{color: i === 0 ? '#639922' : '#185fa5', margin:'0 0 0.5rem'}}>{s.course.course_code}</h3>
                  <p style={{fontSize:'0.85rem', color:'#666', margin:'0 0 0.75rem'}}>{s.course.course_name}</p>
                  <p style={{fontSize:'0.85rem', margin:'0.25rem 0'}}>👨‍🏫 {s.course.professor}</p>
                  <p style={{fontSize:'0.85rem', margin:'0.25rem 0'}}>⭐ Rating: {s.avgRating} / 5</p>
                  <p style={{fontSize:'0.85rem', margin:'0.25rem 0'}}>📚 Workload: {s.avgWorkload} / 5</p>
                  <p style={{fontSize:'0.85rem', margin:'0.25rem 0'}}>📋 Reviews: {s.total}</p>
                  <p style={{fontSize:'0.85rem', margin:'0.25rem 0'}}>✅ Attendance: {s.attendance > 0 ? 'Required' : 'Not Required'}</p>
                </div>
              ))}
            </div>

            <h3 style={{fontSize:'1rem', color:'#444', margin:'0 0 0.75rem'}}>Rating & Workload</h3>
            <Bar data={barData} options={barOptions} />

            <h3 style={{fontSize:'1rem', color:'#444', margin:'1.5rem 0 0.75rem'}}>Grade Distribution</h3>
            <Bar data={gradeData} options={{...barOptions, scales: {...barOptions.scales, y: {beginAtZero: true, grid: {color:'#f0f0f0'}}}}} />
          </>
        )}

        {!stats1 && !stats2 && (
          <p style={{color:'#888', textAlign:'center', padding:'2rem'}}>Select two courses to compare</p>
        )}
      </div>
    </div>
  )
}