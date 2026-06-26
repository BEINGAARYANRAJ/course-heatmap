import React, { useEffect, useState } from 'react'
import Auth from './components/Auth'
import { supabase } from './supabaseClient'
import CourseForm from './components/CourseForm'
import HeatmapChart from './components/HeatmapChart'
import GradeChart from './components/GradeChart'
import Filters from './components/Filters'
import ReviewForm from './components/ReviewForm'
import ProfessorProfile from './components/ProfessorProfile'
import CourseComparison from './components/CourseComparison'
import RatingTrends from './components/RatingTrends'
import Leaderboard from './components/Leaderboard'
import { exportCSV } from './components/ExportCSV'
import AdminPanel from './components/AdminPanel'
import './App.css'

export default function App() {
  const [courses, setCourses] = useState([])
  const [reviews, setReviews] = useState([])
  const [semester, setSemester] = useState('Fall 2024')
  const [metric, setMetric] = useState('professor_rating')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [user, setUser] = useState(null)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [department, setDepartment] = useState('all')
  const [allData, setAllData] = useState({ courses: [], reviews: [] })

  async function checkAdmin(userId) {
    const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId)
    setIsAdmin(data && data.length > 0)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null
      setUser(u)
      if (u) checkAdmin(u.id)
    })
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
      if (session?.user) checkAdmin(session.user.id)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [semester, department]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true)
    let query = supabase.from('courses').select('*')
    if (semester !== 'all') query = query.eq('semester', semester)
    if (department !== 'all') query = query.eq('department', department)
    const { data: courseData } = await query

    const ids = courseData?.map(c => c.id) || []
    const { data: reviewData } = await supabase
      .from('reviews').select('*').in('course_id', ids)

    const { data: allCourses } = await supabase.from('courses').select('*')
    const { data: allReviews } = await supabase.from('reviews').select('*')
    setAllData({ courses: allCourses || [], reviews: allReviews || [] })

    setCourses(courseData || [])
    setReviews(reviewData || [])
    setLoading(false)
  }

  const filtered = courses.filter(c =>
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.professor.toLowerCase().includes(search.toLowerCase()) ||
    c.course_name.toLowerCase().includes(search.toLowerCase())
  )

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.professor_rating || 0), 0) / reviews.length).toFixed(1) : '—'
  const avgWorkload = reviews.length
    ? (reviews.reduce((s, r) => s + (r.workload_rating || 0), 0) / reviews.length).toFixed(1) : '—'

  return (
    <div className="app">
      {!user ? (
        <Auth onLogin={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user))} />
      ) : (
        <>
          <div style={{textAlign:'right', marginBottom:'0.5rem', fontSize:'0.85rem', color:'#666'}}>
            {user.email} <span style={{color:'#639922', cursor:'pointer'}}
              onClick={() => supabase.auth.signOut()}>Logout</span>
          </div>

          <div className="header">
            <h1>Course Review Heatmap</h1>
            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
              <button className="add-btn" style={{background:'#185fa5'}}
                onClick={() => { setShowCourseForm(f => !f); setShowForm(false) }}>
                {showCourseForm ? 'Close' : '+ Add Course'}
              </button>
              <button className="add-btn" style={{background:'#2a9d8f'}}
                onClick={() => exportCSV(courses, reviews)}>
                Export CSV
              </button>
              <button className="add-btn" style={{background:'#8a2be2'}}
                onClick={() => setShowComparison(f => !f)}>
                Compare
              </button>
              <button className="add-btn"
                onClick={() => { setShowForm(f => !f); setShowCourseForm(false) }}>
                {showForm ? 'Close' : '+ Add Review'}
              </button>
              <button className="add-btn" style={{background:'#ff8800'}}
                onClick={() => setShowTrends(f => !f)}>
                Trends
              </button>
              <button className="add-btn" style={{background:'#e63946'}}
                onClick={() => setShowLeaderboard(f => !f)}>
                Leaderboard
              </button>
              {isAdmin && (
                <button className="add-btn" style={{background:'#333'}}
                  onClick={() => setShowAdmin(f => !f)}>
                  Admin
                </button>
              )}
            </div>
          </div>

          {showCourseForm && <CourseForm onSubmit={() => { fetchData(); setShowCourseForm(false) }} />}

          <Filters
            semester={semester} setSemester={setSemester}
            metric={metric} setMetric={setMetric}
            search={search} setSearch={setSearch}
            department={department} setDepartment={setDepartment}
          />

          {showForm && <ReviewForm courses={courses} onSubmit={() => { fetchData(); setShowForm(false) }} />}

          {loading ? <p>Loading...</p> : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="value">{avgRating}</div>
                  <div className="label">Avg Professor Rating</div>
                </div>
                <div className="stat-card">
                  <div className="value">{avgWorkload}</div>
                  <div className="label">Avg Workload</div>
                </div>
                <div className="stat-card">
                  <div className="value">{filtered.length}</div>
                  <div className="label">Courses Shown</div>
                </div>
                <div className="stat-card">
                  <div className="value">{reviews.length}</div>
                  <div className="label">Total Reviews</div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="card">
                  <h2>Rating Heatmap</h2>
                  <HeatmapChart
                    courses={filtered}
                    reviews={reviews}
                    metric={metric}
                    onProfessorClick={setSelectedProfessor} />
                </div>
                <div className="card">
                  <h2>Grade Distribution</h2>
                  <GradeChart reviews={reviews} />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {selectedProfessor && (
        <ProfessorProfile
          professor={selectedProfessor}
          onClose={() => setSelectedProfessor(null)}
        />
      )}

      {showComparison && (
        <CourseComparison
          courses={courses}
          reviews={reviews}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showTrends && (
        <RatingTrends
          professors={[...new Set(courses.map(c => c.professor))]}
          allData={allData}
          onClose={() => setShowTrends(false)}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          courses={courses}
          reviews={reviews}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showAdmin && (
        <AdminPanel
          courses={courses}
          reviews={reviews}
          onClose={() => setShowAdmin(false)}
          onRefresh={() => { fetchData(); setShowAdmin(false) }}
        />
      )}
    </div>
  )
}