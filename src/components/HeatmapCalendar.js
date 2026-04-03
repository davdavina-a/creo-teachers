'use client';
import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getIntensityColor(count) {
  if (count === 0) return 'var(--color-border)';
  if (count <= 1) return '#D1F0B1';
  if (count <= 3) return '#9EDB7A';
  if (count <= 5) return '#5CB84A';
  return '#2a6b1a';
}

function getWeeksInRange(startDate, endDate) {
  const weeks = [];
  let current = new Date(startDate);
  // Align to Monday
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);

  while (current <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(d.getDate() + i);
      week.push(new Date(d));
    }
    weeks.push(week);
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export default function HeatmapCalendar({ activityData = [], currentStreak = 0, longestStreak = 0 }) {
  const [tooltip, setTooltip] = useState(null);

  // Build a map of date -> exercises count
  const activityMap = {};
  activityData.forEach(a => {
    activityMap[a.activity_date] = a.exercises_completed || 0;
  });

  // Last 16 weeks
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 16 * 7);
  const weeks = getWeeksInRange(startDate, endDate);

  // Calculate month labels
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    if (firstDay.getMonth() !== lastMonth) {
      lastMonth = firstDay.getMonth();
      monthLabels.push({ index: i, label: MONTHS[lastMonth] });
    }
  });

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.95rem", fontWeight: 700 }}>Practice Activity</h3>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>🔥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{currentStreak}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>day streak</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>⭐</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{longestStreak}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>longest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div style={{ display: "flex", gap: 0, marginBottom: "0.25rem", marginLeft: 32 }}>
        {weeks.map((_, i) => {
          const label = monthLabels.find(m => m.index === i);
          return (
            <div key={i} style={{ width: 14, marginRight: 2, fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
              {label ? label.label : ''}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.25rem" }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4, paddingTop: 2 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ height: 14, display: "flex", alignItems: "center", fontSize: 10, color: "var(--color-text-muted)" }}>
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {week.map((date, di) => {
                const dateStr = date.toISOString().split('T')[0];
                const count = activityMap[dateStr] || 0;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isFuture = date > new Date();

                return (
                  <div
                    key={di}
                    style={{
                      width: 14, height: 14, borderRadius: 3, cursor: "pointer",
                      backgroundColor: isFuture ? "var(--color-bg)" : getIntensityColor(count),
                      outline: isToday ? "2px solid var(--color-text)" : "none",
                      outlineOffset: 1,
                    }}
                    onMouseEnter={() => setTooltip({ date: dateStr, count, x: wi, y: di })}
                    onMouseLeave={() => setTooltip(null)}
                    title={`${dateStr}: ${count} exercise${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.75rem", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Less</span>
        {['var(--color-border)', '#D1F0B1', '#9EDB7A', '#5CB84A', '#2a6b1a'].map((color, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color }} />
        ))}
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>More</span>
      </div>
    </div>
  );
}