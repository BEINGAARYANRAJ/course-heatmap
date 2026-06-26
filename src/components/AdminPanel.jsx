import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminPanel({ courses, reviews, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('courses')
  const [deleting, setDeleting] = useState(null)

  async function deleteCourse(id) {
    if (!window.confirm('Delete this course and all its reviews?')) return
    setDeleting(id)
    await supabase.from('reviews').delete().eq('course_id', id)
    await supabase.from('courses').delete().eq('id', id)
    setDeleting(null)
    onRefresh()
  }

  async function deleteReview(id) {
    if (!window.confirm('Delete this review?')) return
    setDeleting(id)
    await supabase.from('reviews').delete().eq('id', id)
    setDeleting(null)
    onRefresh()
  }

  const tabStyle = (tab) => ({
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    background: activeTab === tab ? '#e63946' : '#f0f0f0',
    color: activeTab === tab ? 'white' : '#444',
    transition: 'all 0.2s'
  })

  return (
    <div className="profile-overlay">
      <div className="profile-box" style={{ maxWidth: 750 }}>
        <div className="profile-header">
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>
            Admin Panel
          </h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button style={tabStyle('courses')} onClick={() => setActiveTab('courses')}>
            Courses ({courses.length})
          </button>
          <button style={tabStyle('reviews')} onClick={() => setActiveTab('reviews')}>
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {courses.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center' }}>No courses found.</p>
            )}
            {courses.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f7f9fc', borderRadius: '10px', padding: '0.75rem 1rem'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#639922', marginRight: '0.5rem' }}>
                    {c.course_code}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#444' }}>{c.course_name}</span>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>
                    {c.professor} · {c.semester} · {c.department || 'General'}
                  </div>
                </div>
                <button
                  onClick={() => deleteCourse(c.id)}
                  disabled={deleting === c.id}
                  style={{
                    background: deleting === c.id ? '#ccc' : '#ff4d4d',
                    color: 'white', border: 'none',
                    padding: '0.4rem 0.9rem', borderRadius: '8px',
                    cursor: deleting === c.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem', fontWeight: 600
                  }}>
                  {deleting === c.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {reviews.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center' }}>No reviews found.</p>
            )}
            {reviews.map(r => {
              const course = courses.find(c => c.id === r.course_id)
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f7f9fc', borderRadius: '10px', padding: '0.75rem 1rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#185fa5', marginRight: '0.5rem' }}>
                      {course?.course_code || 'Unknown'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#444' }}>
                      Rating: {r.professor_rating} · Workload: {r.workload_rating} · Grade: {r.grade}
                    </span>
                    {r.comment && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                        "{r.comment}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={deleting === r.id}
                    style={{
                      background: deleting === r.id ? '#ccc' : '#ff4d4d',
                      color: 'white', border: 'none',
                      padding: '0.4rem 0.9rem', borderRadius: '8px',
                      cursor: deleting === r.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem', fontWeight: 600
                    }}>
                    {deleting === r.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}