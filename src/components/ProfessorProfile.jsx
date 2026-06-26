import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function ProfessorProfile({ professor, onClose }) {
  const [courses, setCourses] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [professor]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true)
    const { data: courseData } = await supabase
      .from('courses').select('*').eq('professor', professor)

    const ids = courseData?.map(c => c.id) || []
    const { data: reviewData } = await supabase
      .from('reviews').select('*').in('course_id', ids)

    setCourses(courseData || [])
    setReviews(reviewData || [])
    setLoading(false)
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.professor_rating || 0), 0) / reviews.length).toFixed(1) : '—'
  const avgWorkload = reviews.length
    ? (reviews.reduce((s, r) => s + (r.workload_rating || 0), 0) / reviews.length).toFixed(1) : '—'
  const attendanceCount = reviews.filter(r => r.attendance_required).length
  const grades = ['A', 'B', 'C', 'D', 'F']
  const gradeCounts = grades.map(g => reviews.filter(r => r.grade === g).length)

  const gradeData = {
    labels: grades,
    datasets: [{
      data: gradeCounts,
      backgroundColor: ['#639922','#85b735','#ffcc00','#ff8800','#ff4d4d'],
      borderRadius: 8
    }]
  }

  const gradeOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  }

  return (
    <div className="profile-overlay">
      <div className="profile-box">
        <div className="profile-header">
          <div className="professor-avatar">
            {professor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2>{professor}</h2>
            <p style={{color:'#888', fontSize:'0.9rem'}}>{courses.length} course{courses.length !== 1 ? 's' : ''} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            <div className="profile-stats">
              <div className="stat-card">
                <div className="value">{avgRating}</div>
                <div className="label">Avg Rating</div>
              </div>
              <div className="stat-card">
                <div className="value">{avgWorkload}</div>
                <div className="label">Avg Workload</div>
              </div>
              <div className="stat-card">
                <div className="value">{attendanceCount}</div>
                <div className="label">Attendance Required</div>
              </div>
            </div>

            <h3 style={{margin:'1.5rem 0 0.75rem', fontSize:'1rem', color:'#444'}}>Courses Taught</h3>
            <div className="course-list">
              {courses.map(c => (
                <div key={c.id} className="course-pill">
                  <span className="course-code">{c.course_code}</span>
                  <span className="course-name">{c.course_name}</span>
                  <span className="course-sem">{c.semester}</span>
                </div>
              ))}
            </div>
            
            {reviews.filter(r => r.comment).length > 0 && (
  <div style={{ marginTop: '1.5rem' }}>
    <h3 style={{ fontSize: '1rem', color: '#444', marginBottom: '0.75rem' }}>
      Student Comments
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {reviews.filter(r => r.comment).map(r => {
        const course = courses.find(c => c.id === r.course_id)
        return (
          <div key={r.id} style={{
            background: '#f7f9fc',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            borderLeft: '4px solid #639922'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '0.4rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#639922' }}>
                {course?.course_code || 'Unknown'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>
                Rating: {r.professor_rating} / 5
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#444', margin: 0 }}>{r.comment}</p>
          </div>
        )
      })}
    </div>
  </div>
)}

            <h3 style={{margin:'1.5rem 0 0.75rem', fontSize:'1rem', color:'#444'}}>Grade Distribution</h3>
            <Bar data={gradeData} options={gradeOptions} />
          </>
        )}
      </div>
    </div>
  )
}