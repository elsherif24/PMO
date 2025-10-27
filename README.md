# Recovery Tracker — AI System Summary

## Core Concept
Points-based recovery system replacing streak-based tracking. Designed to reduce "all-or-nothing" psychology and encourage multiple positive behaviors.

## Point Economy

### Passive
- +1 point per hour (automatic clean time tracking)

### Prayers (5 per day, start missed)
- Each day starts with 5 missed prayers (-100 points applied)
- User must log each prayer (0-5 daily limit):
  - **Qadaa**: +20 points (makes up for -20 missed)
  - **On Time**: +25 points (+20 makeup + 5 bonus)
  - **In Mosque**: +35 points (+20 makeup + 15 bonus)
- Prayer names displayed: Fajr, Duhr, Asr, Maghrib, Isha
- Buttons disabled after 5 prayers logged

### Study (daily requirement)
- Editable entry throughout day (total hours)
- Threshold: 2 hours minimum
- < 2 hours: -20 points
- ≥ 2 hours: +8 points per hour

### Good Deeds (optional)
- Ghusl: +25
- Quran: +15
- Exercise: +10

### Penalties
- Masturbation: -70
- Porn: -140
- Points can go negative

## Rank System
27 ranks from Iron III (0 pts) to Challenger I (210k+ pts). Points-based progression with demotion enabled.

Key thresholds:
- Iron III: 0
- Bronze I: 1,300
- Silver I: 3,300
- Gold I: 7,000
- Platinum I: 14,500
- Diamond I: 60,000
- Master I: 91,000
- Challenger I: 210,000+

## State Schema
```json
{
  "version": 2,
  "points": -100,
  "prayersLoggedToday": 0,
  "todayDate": "YYYY-MM-DD",
  "todayPoints": -100,
  "todayStudyHours": 0,
  "lastCleanHourUpdate": timestamp,
  "createdAt": timestamp
}
```

## Daily Mechanics
- Day rollover at midnight resets prayers to 0, deducts 100 points for new missed prayers
- Study hours editable (calculates point diff when updated)
- Clean hours accumulate automatically
- All data in localStorage, completely offline

## UI Features
- Real-time point updates with animations
- Prayer buttons disable after 5 logs
- Shows next prayer name based on count
- Confirmation modals for relapses/reset
- Toast notifications for feedback
- Today's summary shows net points

## Key Behavioral Design
- Start each day at -100 (must work to neutral)
- Relapses costly but recoverable same day
- Multiple paths to positive points
- Long-term ranks reward consistency over perfection
- Negative points allowed (realistic accountability)