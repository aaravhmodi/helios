'use client'

import { useState } from 'react'
import styles from './FoodList.module.css'

export interface FoodItem {
  id: string
  name: string
  category: string
  description: string
  available: boolean
}

const FOOD_CATEGORIES = [
  'Fresh crops',
  'Stored staples',
  'Algae protein',
  'Insect protein',
  'Hydroponics greens',
  'Fortified meals',
  'Emergency rations'
]

const SAMPLE_FOODS: FoodItem[] = [
  { id: '1', name: 'Lettuce (Hydroponic)', category: 'Hydroponics greens', description: 'Fresh leafy greens', available: true },
  { id: '2', name: 'Tomatoes', category: 'Fresh crops', description: 'Fresh vine tomatoes', available: true },
  { id: '3', name: 'Quinoa', category: 'Stored staples', description: 'Protein-rich grain', available: true },
  { id: '4', name: 'Spirulina', category: 'Algae protein', description: 'High-protein algae supplement', available: true },
  { id: '5', name: 'Mealworm Protein', category: 'Insect protein', description: 'Sustainable protein source', available: true },
  { id: '6', name: 'Fortified Nutrition Bar', category: 'Fortified meals', description: 'Complete nutrition supplement', available: true },
  { id: '7', name: 'Emergency Ration Pack', category: 'Emergency rations', description: 'Long-shelf-life emergency food', available: true }
]

interface FoodListProps {
  selectedFoods: string[]
  onFoodToggle: (foodId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function FoodList({
  selectedFoods,
  onFoodToggle,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: FoodListProps) {
  const filteredFoods = SAMPLE_FOODS.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={styles.categorySelect}
        >
          <option value="All">All Categories</option>
          {FOOD_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.foodList}>
        {filteredFoods.length > 0 ? (
          filteredFoods.map(food => (
            <div
              key={food.id}
              className={`${styles.foodItem} ${selectedFoods.includes(food.id) ? styles.foodItemSelected : ''} ${!food.available ? styles.foodItemUnavailable : ''}`}
              onClick={() => food.available && onFoodToggle(food.id)}
            >
              <div className={styles.foodItemHeader}>
                <span className={styles.foodItemName}>{food.name}</span>
                <span className={styles.foodItemCategory}>{food.category}</span>
              </div>
              <span className={styles.foodItemDesc}>{food.description}</span>
              {!food.available && (
                <span className={styles.unavailableLabel}>Currently Unavailable</span>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResults}>No foods found</div>
        )}
      </div>
    </div>
  )
}
