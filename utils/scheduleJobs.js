import schedule from 'node-schedule';

/**
 * Schedules automatic venue status updates
 * @param {Date} endTime - When to trigger the status change
 * @param {string} roomnumber - Venue identifier
 * @param {SocketIO.Server} io - Socket.IO instance
 */
export function scheduleVenueFreeingJob(endTime, roomnumber, io) {
  if (!endTime || !roomnumber || !io) {
    console.warn('⚠ Schedule aborted - Missing parameters');
    return;
  }

  const jobTime = new Date(endTime);
  if (isNaN(jobTime.getTime())) {
    console.warn('⚠ Invalid endTime:', endTime);
    return;
  }

  // Schedule the job
  const job = schedule.scheduleJob(jobTime, () => {
    try {
      io.emitVenueStatusChange(roomnumber, 'free');
      console.log(`✅ Auto-freed venue: ${roomnumber}`);
    } catch (err) {
      console.error('Schedule job failed:', err);
    }
  });

  // Log scheduling details
  if (job) {
    console.log(`📅 Scheduled venue free: ${roomnumber} at ${jobTime.toISOString()}`);
    return job;
  }

  console.warn('⚠ Failed to schedule job');
  return null;
}

/**
 * Cancels pending venue scheduling jobs
 * @param {schedule.Job} job - The job to cancel
 */
export function cancelScheduledJob(job) {
  if (job && typeof job.cancel === 'function') {
    job.cancel();
    console.log('❌ Cancelled scheduled job');
  }
}