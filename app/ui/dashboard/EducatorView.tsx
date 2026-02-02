'use client'

import { useState } from 'react'
import { CURRICULUM_DATA, CurriculumItem, getUpcomingCurriculum } from '../../core/curriculum'
import styles from './RoleBasedViews.module.css'

export default function EducatorView() {
  const [selectedGrade, setSelectedGrade] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'upcoming' | 'completed'>('all')
  
  const allGrades = ['All', ...CURRICULUM_DATA.map(g => g.grade)]
  const upcomingItems = getUpcomingCurriculum()
  
  const getFilteredCurriculum = (): CurriculumItem[] => {
    let items: CurriculumItem[] = []
    
    if (selectedGrade === 'All') {
      items = CURRICULUM_DATA.flatMap(level => level.curriculum)
    } else {
      items = CURRICULUM_DATA.find(g => g.grade === selectedGrade)?.curriculum || []
    }
    
    if (filterStatus !== 'all') {
      items = items.filter(item => item.status === filterStatus)
    }
    
    return items
  }
  
  const filteredCurriculum = getFilteredCurriculum()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50'
      case 'in-progress': return '#2196f3'
      case 'upcoming': return '#ff9800'
      default: return '#757575'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'upcoming': return 'Upcoming'
      default: return status
    }
  }
  
  // Calculate statistics
  const stats = {
    total: filteredCurriculum.length,
    completed: filteredCurriculum.filter(i => i.status === 'completed').length,
    inProgress: filteredCurriculum.filter(i => i.status === 'in-progress').length,
    upcoming: filteredCurriculum.filter(i => i.status === 'upcoming').length
  }
  
  return (
    <div className={styles.educatorView}>
      <h2 className={styles.viewTitle}>Education Dashboard - Curriculum Management</h2>
      <p className={styles.viewDescription}>
        Manage curriculum for Grades 1-12 and University level programs. Track progress, assign resources, and monitor student advancement.
      </p>
      
      {/* Statistics Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Items</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#4caf50' }}>{stats.completed}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#2196f3' }}>{stats.inProgress}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#ff9800' }}>{stats.upcoming}</div>
          <div className={styles.statLabel}>Upcoming</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Grade Level:</label>
          <select 
            value={selectedGrade} 
            onChange={(e) => setSelectedGrade(e.target.value)}
            className={styles.filterSelect}
          >
            {allGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {/* Upcoming Priority Items */}
      {upcomingItems.length > 0 && (
        <div className={styles.prioritySection}>
          <h3 className={styles.sectionTitle}>Priority Items (Upcoming & In Progress)</h3>
          <div className={styles.curriculumList}>
            {upcomingItems.slice(0, 5).map(item => (
              <div key={item.id} className={styles.curriculumCard}>
                <div className={styles.curriculumHeader}>
                  <div>
                    <div className={styles.curriculumGrade}>{item.grade}</div>
                    <div className={styles.curriculumSubject}>{item.subject}</div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {getStatusLabel(item.status)}
                  </div>
                </div>
                <div className={styles.curriculumTopic}>{item.topic}</div>
                <div className={styles.curriculumDescription}>{item.description}</div>
                {item.dueDate && (
                  <div className={styles.curriculumDueDate}>
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                )}
                {item.resources.length > 0 && (
                  <div className={styles.curriculumResources}>
                    <strong>Resources:</strong> {item.resources.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Full Curriculum List */}
      <div className={styles.curriculumSection}>
        <h3 className={styles.sectionTitle}>
          {selectedGrade === 'All' ? 'All Curriculum' : `${selectedGrade} Curriculum`}
        </h3>
        <div className={styles.curriculumList}>
          {filteredCurriculum.length > 0 ? (
            filteredCurriculum.map(item => (
              <div key={item.id} className={styles.curriculumCard}>
                <div className={styles.curriculumHeader}>
                  <div>
                    <div className={styles.curriculumGrade}>{item.grade}</div>
                    <div className={styles.curriculumSubject}>{item.subject}</div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {getStatusLabel(item.status)}
                  </div>
                </div>
                <div className={styles.curriculumTopic}>{item.topic}</div>
                <div className={styles.curriculumDescription}>{item.description}</div>
                {item.dueDate && (
                  <div className={styles.curriculumDueDate}>
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                )}
                {item.resources.length > 0 && (
                  <div className={styles.curriculumResources}>
                    <strong>Resources:</strong> {item.resources.join(', ')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>No curriculum items found for selected filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}
