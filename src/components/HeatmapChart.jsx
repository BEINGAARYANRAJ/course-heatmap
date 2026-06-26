import { useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

ChartJS.register(MatrixController, MatrixElement, CategoryScale, LinearScale, Tooltip, Legend)

function getColor(value, hasReviews) {
  if (!hasReviews) return `rgba(180, 180, 180, 0.5)`
  const ratio = value / 5
  if (ratio > 0.7) return `rgba(99, 153, 34, 0.85)`
  if (ratio > 0.4) return `rgba(255, 204, 0, 0.85)`
  return `rgba(255, 77, 77, 0.85)`
}

export default function HeatmapChart({ courses, reviews, metric, onProfessorClick }) {
  const chartRef = useRef(null)

  const professors = [...new Set(courses.map(c => c.professor))]

  const data = courses.map(course => {
    const courseReviews = reviews.filter(r => r.course_id === course.id)
    const hasReviews = courseReviews.length > 0
    const avg = hasReviews
      ? courseReviews.reduce((sum, r) => sum + (parseFloat(r[metric]) || 0), 0) / courseReviews.length
      : 0
    return {
      x: course.course_code,
      y: course.professor,
      v: parseFloat(avg.toFixed(1)),
      name: course.course_name,
      hasReviews
    }
  })

  const chartData = {
    datasets: [{
      label: metric,
      data,
      backgroundColor: ctx => {
        const d = ctx.dataset.data[ctx.dataIndex]
        return getColor(d?.v || 0, d?.hasReviews)
      },
      borderRadius: 6,
      width: 80,
      height: 50
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: ctx => ctx[0].dataset.data[ctx[0].dataIndex]?.name,
          label: ctx => {
            const d = ctx.dataset.data[ctx.dataIndex]
            if (!d.hasReviews) return ['No reviews yet']
            return [`Course: ${d.x}`, `Professor: ${d.y}`, `Score: ${d.v} / 5`]
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        labels: [...new Set(courses.map(c => c.course_code))],
        grid: { display: false },
        ticks: { font: { size: 13, weight: '600' } }
      },
      y: {
        type: 'category',
        labels: professors,
        grid: { display: false },
        ticks: { font: { size: 13 }, color: '#185fa5' }
      }
    }
  }

  function handleClick(event) {
    const chart = chartRef.current
    if (!chart) return
    const points = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    )
    if (points.length > 0) {
      const index = points[0].index
      const d = chartData.datasets[0].data[index]
      if (d && d.y) onProfessorClick(d.y)
    }
  }

  return (
    <div>
      <div style={{
        display: 'flex', gap: '0.5rem',
        flexWrap: 'wrap', marginBottom: '0.75rem'
      }}>
        {professors.map(prof => (
          <button
            key={prof}
            onClick={() => onProfessorClick(prof)}
            style={{
              background: 'none', border: 'none',
              color: '#185fa5', cursor: 'pointer',
              fontSize: '0.85rem', textDecoration: 'underline',
              padding: '2px 6px'
            }}
          >
            {prof}
          </button>
        ))}
      </div>
      <Chart
        ref={chartRef}
        type="matrix"
        data={chartData}
        options={options}
        onClick={handleClick}
      />
      <div className="legend">
        <span>Low</span>
        <div className="legend-bar" />
        <span>High</span>
      </div>
    </div>
  )
}