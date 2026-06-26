export default function Leaderboard({ courses, reviews, onClose }) {
  function getStats(course) {
    const courseReviews = reviews.filter(r => r.course_id === course.id)
    if (!courseReviews.length) return null
    const avgRating = parseFloat(
      (courseReviews.reduce((s, r) => s + (r.professor_rating || 0), 0) / courseReviews.length).toFixed(1)
    )
    const avgWorkload = parseFloat(
      (courseReviews.reduce((s, r) => s + (r.workload_rating || 0), 0) / courseReviews.length).toFixed(1)
    )
    return { ...course, avgRating, avgWorkload, reviewCount: courseReviews.length }
  }

  const stats = courses.map(getStats).filter(Boolean)
  const byRating = [...stats].sort((a, b) => b.avgRating - a.avgRating)
  const byWorkload = [...stats].sort((a, b) => a.avgWorkload - b.avgWorkload)

  function RatingBar({ value, max = 5, color }) {
    return (
      <div style={{ background: '#f0f0f0', borderRadius: 6, height: 8, width: '100%', marginTop: 4 }}>
        <div style={{
          width: `${(value / max) * 100}%`,
          background: color,
          borderRadius: 6,
          height: '100%',
          transition: 'width 0.4s'
        }} />
      </div>
    )
  }

  function Row({ item, rank, metric, color }) {
    const value = metric === 'rating' ? item.avgRating : item.avgWorkload
    const medals = ['🥇', '🥈', '🥉']
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: rank === 0 ? '#f7f9fc' : 'white',
        borderRadius: 12, padding: '0.75rem 1rem',
        border: rank === 0 ? `2px solid ${color}` : '1px solid #eee',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.3rem', minWidth: 28 }}>
          {rank < 3 ? medals[rank] : `#${rank + 1}`}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {item.course_code} — {item.professor}
            </span>
            <span style={{ fontWeight: 700, color, fontSize: '0.95rem' }}>{value} / 5</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>
            {item.course_name} · {item.reviewCount} review{item.reviewCount !== 1 ? 's' : ''}
          </div>
          <RatingBar value={value} color={color} />
        </div>
      </div>
    )
  }

  return (
    <div className="profile-overlay">
      <div className="profile-box">
        <div className="profile-header">
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Leaderboard</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        {stats.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
            No reviews yet to rank!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#639922', marginBottom: '0.75rem' }}>
                Top Rated Professors
              </h3>
              {byRating.map((item, i) => (
                <Row key={item.id} item={item} rank={i} metric="rating" color="#639922" />
              ))}
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', color: '#185fa5', marginBottom: '0.75rem' }}>
                Easiest Workload
              </h3>
              {byWorkload.map((item, i) => (
                <Row key={item.id} item={item} rank={i} metric="workload" color="#185fa5" />
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '1.5rem', background: '#f7f9fc',
          borderRadius: 12, padding: '1rem'
        }}>
          <h3 style={{ fontSize: '0.95rem', color: '#444', marginBottom: '0.5rem' }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Best Rating', value: byRating[0] ? `${byRating[0].avgRating} — ${byRating[0].professor}` : '—' },
              { label: 'Easiest Course', value: byWorkload[0] ? `${byWorkload[0].course_code}` : '—' },
              { label: 'Most Reviewed', value: [...stats].sort((a,b) => b.reviewCount - a.reviewCount)[0]?.professor || '—' }
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}