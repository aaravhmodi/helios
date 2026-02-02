'use client'

import { useState } from 'react'
import { CrewRole } from '../../core/models'
import { CREW_ROLES, getRoleDefinition } from '../../core/roles'
import styles from './RolePicker.module.css'

interface RolePickerProps {
  selectedRole: CrewRole | ''
  onRoleChange: (role: CrewRole) => void
}

export default function RolePicker({ selectedRole, onRoleChange }: RolePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const filteredRoles = CREW_ROLES.filter(role =>
    role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const selectedRoleDef = selectedRole ? getRoleDefinition(selectedRole) : null
  
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        What is your role on Kepler Station?
        <span className={styles.infoIcon} title="Your role determines which metrics and alerts are prioritized for you">
          ℹ️
        </span>
      </label>
      
      <div className={styles.pickerContainer}>
        <div
          className={styles.selectedRole}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedRoleDef ? (
            <>
              <div className={styles.selectedRoleInfo}>
                <span className={styles.selectedRoleName}>{selectedRoleDef.displayName}</span>
                <span className={styles.selectedRoleDesc}>{selectedRoleDef.description}</span>
              </div>
              <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </>
          ) : (
            <>
              <span className={styles.placeholder}>Select your role...</span>
              <span className={styles.arrow}>▼</span>
            </>
          )}
        </div>
        
        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>
            
            <div className={styles.roleList}>
              {filteredRoles.length > 0 ? (
                filteredRoles.map(role => (
                  <div
                    key={role.id}
                    className={`${styles.roleOption} ${selectedRole === role.id ? styles.roleOptionSelected : ''}`}
                    onClick={() => {
                      onRoleChange(role.id)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                  >
                    <div className={styles.roleOptionHeader}>
                      <span className={styles.roleOptionName}>{role.displayName}</span>
                    </div>
                    <span className={styles.roleOptionDesc}>{role.description}</span>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>No roles found</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedRoleDef && (
        <div className={styles.roleDetails}>
          <div className={styles.roleDetailsTitle}>Key Responsibilities:</div>
          <ul className={styles.roleDetailsList}>
            {selectedRoleDef.keyResponsibilities.map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
