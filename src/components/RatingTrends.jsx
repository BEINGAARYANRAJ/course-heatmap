import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const SEMESTERS = ['Fall 2023', 'Spring 2024', 'Fall 2024']
const COLORS = ['#639922', '#185fa5', '#8a2be2', '#ff8800']

export default function RatingTrends({ professors, allData, onClose }) {
  const [metric, setMetric] = useState('professor_rating')

  if (!professors || professors.length === 0) {
    return (
      <div className="profile-overlay">
        <div className="profile-box">
          <div className="profile-header">
            <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Rating Trends</h2>
            <button className="close-btn" onClick={onClose}>X</button>
          </div>
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No data available.</p>
        </div>
      </div>
    )
  }

  const datasets = professors.map((prof, i) => {
    const points = SEMESTERS.map(sem => {
      const semCourses = (allData.courses || []).filter(
        c => c.professor === prof && c.semester === sem
      )
      const ids = semCourses.map(c => c.id)
      const revs = (allData.reviews || []).filter(r => ids.includes(r.course_id))
      if (!revs.length) return null
      return parseFloat(
        (revs.reduce((s, r) => s + (parseFloat(r[metric]) || 0), 0) / revs.length).toFixed(1)
      )
    })

    return {
      label: prof,
      data: points,
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '22',
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      spanGaps: true
    }
  })

  const chartData = { labels: SEMESTERS, datasets }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y ?? 'No data'} / 5`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        grid: { color: '#f0f0f0' },
        ticks: { stepSize: 1 }
      },
      x: { grid: { display: false } }
    }
  }

  const hasAnyData = datasets.some(d => d.data.some(v => v !== null))

  return (
    <div className="profile-overlay">
      <div className="profile-box">
        <div className="profile-header">
          <h2 style={{ border: 'none', padding: 0, margin: 0 }}>Rating Trends Over Time</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Metric</label>
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="professor_rating">Professor Rating</option>
            <option value="workload_rating">Workload Rating</option>
          </select>
        </div>

        {!hasAnyData ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
            Not enough data across semesters yet. Add courses for multiple semesters!
          </p>
        ) : (
          <Line data={chartData} options={options} />
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#444', marginBottom: '0.75rem' }}>Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {professors.map((prof, i) => {
              const points = datasets[i].data.filter(v => v !== null)
              const trend = points.length >= 2
                ? points[points.length - 1] - points[0] > 0 ? 'Improving' : 'Declining'
                : 'Not enough data'
              return (
                <div key={prof} style={{
                  display: 'flex', justifyContent: 'space-between',
                  background: '#f7f9fc', borderRadius: '10px', padding: '0.6rem 1rem'
                }}>
                  <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>{prof}</span>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>{trend}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}