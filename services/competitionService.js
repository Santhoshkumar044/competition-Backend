export class CompetitionService {
  constructor(models) {
    this.models = models;
  }

  async saveNewCompetitions(newCompetitions) {
    if (!newCompetitions || newCompetitions.length === 0) {
      console.log('No competitions provided to save.');
      return;
    }

    const Competition = this.models.Competition;
    let inserted = 0, updated = 0, skipped = 0;

    for (const comp of newCompetitions) {
      try {
        const existing = await Competition.findOne({ link: comp.link });

        if (existing) {
          // Skip competitions already approved or rejected
          if (['approved', 'rejected'].includes(existing.status)) {
            skipped++;
            continue;
          }

          // Optionally update if it's still pending
          await Competition.updateOne(
            { link: comp.link },
            { $set: { ...comp } }
          );
          updated++;
        } else {
          // Insert new competition with status pending
          await Competition.create({
            ...comp,
            source: 'scraped',
            status: 'pending'
          });
          inserted++;
        }
      } catch (err) {
        console.error(`❌ Error processing: ${comp.title} - ${err.message}`);
      }
    }

    console.log(`✅ Competitions processed: ${newCompetitions.length}`);
    console.log(`  ↪ Inserted: ${inserted}`);
    console.log(`  ↪ Updated (pending): ${updated}`);
    console.log(`  ↪ Skipped (approved/rejected): ${skipped}`);
  }
}