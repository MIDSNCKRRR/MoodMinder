# Database Scripts

This directory contains scripts for managing test data in the MoodMinder application.

## Scripts

### `create-test-data.ts`
Creates comprehensive test data for the Sensory Score Analysis chart and other components.

**Usage:**
```bash
npm run db:seed
```

**What it creates:**
- 1 test user (`testuser@example.com`)
- 10 journal entries across 7 days
- Variety of journal types: emotion, reframing, identity, gratitude
- Different emotion levels (2-5) to show progression
- Body mapping data for sensory expansion scoring
- Multiple entries per day for some days to show engagement

**Data Distribution:**
- **Monday**: Low start (2/5) - reframing journal with tension areas
- **Tuesday**: Improvement (3/5) - identity journal + morning tiredness entry
- **Wednesday**: Good day (4/5) - emotion journal + evening reframing
- **Thursday**: Peak day (5/5) - gratitude journal
- **Friday**: Maintaining high (4/5) - identity with good matching + morning gratitude
- **Saturday**: Slight dip (3/5) - reframing journal
- **Sunday**: Balanced end (4/5) - emotion journal

### `clear-test-data.ts`
Removes all test data from the database.

**Usage:**
```bash
npm run db:clear
```

**What it removes:**
- Test user and all associated data
- Journal entries
- Daily reflections
- Crisis events

## Sensory Score Analysis Components

The test data is designed to demonstrate the three components of the Sensory Score Analysis:

1. **Relaxation Score (40%)**: Based on emotion level and body mapping tension areas
2. **Self-Acceptance Score (30%)**: Higher for identity journals with matching scores
3. **Reframing Success Rate (30%)**: Higher for reframing journals with content engagement

## Usage Flow

1. **Setup test data**: `npm run db:seed`
2. **View in app**: Navigate to Insights page to see populated charts
3. **Clear data**: `npm run db:clear` when done testing
4. **Repeat**: Run seed again for fresh test data

## Expected Chart Results

The data generates a wave pattern showing:
- Monday-Tuesday: Lower sensory scores (building up)
- Wednesday-Thursday: Peak performance days
- Friday: Sustained high performance
- Weekend: Balanced/reflective period

This creates realistic data that demonstrates the app's analytics capabilities while showing meaningful patterns in emotional well-being tracking.