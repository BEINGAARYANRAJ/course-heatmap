import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function GradeChart({ reviews }) {
  const grades = ['A', 'B', 'C', 'D', 'F']
  const counts = grades.map(g => reviews.filter(r => r.grade === g).length)

  const data = {
    labels: grades,
    datasets: [{
      data: counts,
      backgroundColor: ['#639922','#85b735','#ffcc00','#ff8800','#ff4d4d'],
      borderRadius: 8
    }]
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  }

  return <Bar data={data} options={options} />
}