export function exportCSV(courses, reviews) {
  const rows = courses.map(course => {
    const courseReviews = reviews.filter(r => r.course_id === course.id)
    const avgRating = courseReviews.length
      ? (courseReviews.reduce((s, r) => s + (r.professor_rating || 0), 0) / courseReviews.length).toFixed(1)
      : 'No reviews'
    const avgWorkload = courseReviews.length
      ? (courseReviews.reduce((s, r) => s + (r.workload_rating || 0), 0) / courseReviews.length).toFixed(1)
      : 'No reviews'
    const grades = courseReviews.map(r => r.grade).join(', ') || 'No reviews'
    const comments = courseReviews.map(r => r.comment).filter(Boolean).join(' | ') || 'No comments'
    const attendance = courseReviews.some(r => r.attendance_required) ? 'Yes' : 'No'

    return {
      'Course Code': course.course_code,
      'Course Name': course.course_name,
      'Professor': course.professor,
      'Department': course.department || 'General',
      'Semester': course.semester,
      'Credits': course.credits,
      'Avg Professor Rating': avgRating,
      'Avg Workload': avgWorkload,
      'Grades': grades,
      'Attendance Required': attendance,
      'Total Reviews': courseReviews.length,
      'Comments': comments
    }
  })

  const headers = Object.keys(rows[0] || {})
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `course-heatmap-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}