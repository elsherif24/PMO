# Recovery Tracker - Project Summary

## What It Is
A local-first, offline points-based recovery tracker for PMO addiction. Uses gamification (27 ranks) to encourage sustainable recovery through multiple positive behaviors rather than streak-based thinking.

## Core Mechanics

### Daily Cycle
- Each day starts at -100 points (5 missed prayers)
- User logs prayers (3 options, 5 max per day)
- Updates study hours throughout day (editable)
- Logs optional good deeds
- Points can go negative

### Point System
**Prayers (5 daily, auto-missed):**
- Qadaa: +20
- On Time: +25  
- In Mosque: +35

**Study (2hr threshold):**
- < 2 hours: -20
- ≥ 2 hours: +8/hour

**Good Deeds:**
- Ghusl: +25
- Quran: +15
- Exercise: +10

**Penalties:**
- Masturbation: -70
- Porn: -140

**Passive:**
- +1 per clean hour

### Progression
27 ranks from Iron III (0pts) to Challenger I (210k+pts). Demotion enabled.

## Technical
- Pure HTML/CSS/JS
- localStorage only
- No servers, no network
- Export/Import JSON backups

## Design Philosophy
Relapses cost 1-2 days of progress (not months). Multiple paths to positive points. Start each day negative to force accountability. Long-term ranks reward consistency over perfection.