import styles from './ChatMessage.module.css'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.label}>
        {role === 'user' ? 'Explorer' : 'Jarvis'}
      </div>
      <div className={styles.content}>
        {content}
      </div>
    </div>
  )
}