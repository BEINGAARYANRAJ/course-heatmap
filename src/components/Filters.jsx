export default function Filters({ semester, setSemester, metric, setMetric, search, setSearch, department, setDepartment }) {
  return (
    <div className="filters">
      <select value={semester} onChange={e => setSemester(e.target.value)}>
        <option value="all">All Semesters</option>
        <option>Fall 2024</option>
        <option>Spring 2024</option>
        <option>Fall 2023</option>
      </select>

      <select value={department} onChange={e => setDepartment(e.target.value)}>
        <option value="all">All Departments</option>
        <option>Computer Science</option>
        <option>Mathematics</option>
        <option>Physics</option>
        <option>Chemistry</option>
        <option>Biology</option>
        <option>Economics</option>
        <option>General</option>
      </select>

      <select value={metric} onChange={e => setMetric(e.target.value)}>
        <option value="professor_rating">Professor Rating</option>
        <option value="workload_rating">Workload</option>
        <option value="attendance_required">Attendance</option>
      </select>

      <input
        type="text"
        placeholder="Search course or professor..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />
    </div>
  )
}