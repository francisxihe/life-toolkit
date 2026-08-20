import React from 'react';
import { Search, X } from 'lucide-react';
import { useCalendarContext } from './context';
import styles from './SearchBar.module.less';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useCalendarContext();
  return (
    <div className={styles.bar}>
      <div className={styles.field}>
        <Search className={styles.icon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className={styles.input}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className={styles.clear}
          >
            <X className={styles.clearIcon} />
          </button>
        )}
      </div>
    </div>
  );
}
