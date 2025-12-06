// services/scheduler.js - SUNDAY ONLY DRAW
const cron = require('node-cron');
const Member = require('../models/memberModel');
const Winner = require('../models/winnerModel');
const Message = require('../models/messageModel');

class SchedulerService {
  constructor() {
    this.scheduledJob = null;
    this.lastDrawTime = null;
    this.scheduledWinners = null;
    this.isRunning = false;
  }

  // Start the scheduler (auto-draw on SUNDAY at 8 PM only)
  startScheduler() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    // Schedule: 20:00 (8 PM) on SUNDAY only
    // Cron format: minute hour day month day-of-week
    // 0 20 * * 0 = Sunday at 8 PM
    this.scheduledJob = cron.schedule('0 20 * * 0', async () => {
      console.log('🎯 Sunday 8 PM Draw triggered at', new Date().toLocaleString());
      await this.performAutoDraw();
    });

    this.isRunning = true;
    console.log('✅ Sunday Scheduler started - Auto-draw every SUNDAY at 8:00 PM');
  }

  // Stop the scheduler
  stopScheduler() {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
      this.isRunning = false;
      console.log('⏹️  Scheduler stopped');
    }
  }

  // Perform auto-draw (TRULY RANDOM - Fisher-Yates)
  async performAutoDraw() {
    try {
      // Get all active members (with chits, including winners who still pay)
      const activeMembers = await Member.find({ 
        chitRemoved: false,
        status: 'ACTIVE'
      });

      if (activeMembers.length < 2) {
        console.log('⚠️  Not enough active members for draw');
        return;
      }

      // TRULY RANDOM - Fisher-Yates shuffle
      const shuffled = this.shuffleArray(activeMembers);
      const winners = shuffled.slice(0, 2);

      // Get current week
      const winnerCount = await Winner.countDocuments();
      const currentWeek = Math.floor(winnerCount / 2) + 1;

      // Calculate pot (ALL members pay ₹500, including winners)
      const totalActiveMembers = await Member.countDocuments({ status: 'ACTIVE' });
      const totalPot = totalActiveMembers * 500;
      
      // FIX: EQUAL AMOUNT FOR ALL WINNERS (split equally)
      const prizePerWinner = totalPot / 2;

      // Create winner records
      const winnerData = [];
      for (const member of winners) {
        const winnerRecord = new Winner({
          member: member._id,
          week: currentWeek,
          amountWon: prizePerWinner,
          status: 'SELECTED'
        });
        await winnerRecord.save();

        // Update member - mark chit as removed (can't win again)
        await Member.findByIdAndUpdate(member._id, {
          chitRemoved: true,
          wonInWeek: currentWeek,
          wonAmount: prizePerWinner,
          wonDate: new Date()
        });

        // Send WON message to winner
        await this.sendMessage(member._id, 'WON', {
          amount: prizePerWinner,
          week: currentWeek
        });

        winnerData.push({
          _id: member._id,
          name: member.name,
          phone: member.phone,
          amountWon: prizePerWinner
        });
      }

      // Send ANNOUNCEMENT to other members
      const otherMembers = activeMembers.filter(
        m => !winners.find(w => w._id.toString() === m._id.toString())
      );
      
      for (const member of otherMembers) {
        await this.sendMessage(member._id, 'ANNOUNCEMENT', { week: currentWeek });
      }

      // Store scheduled winners for display
      this.scheduledWinners = {
        week: currentWeek,
        winners: winnerData,
        totalPot: totalPot,
        drawnAt: new Date(),
        displayed: false
      };

      this.lastDrawTime = new Date();

      console.log(`✅ SUNDAY DRAW COMPLETE - Week ${currentWeek}`);
      console.log(`🏆 Winners: ${winnerData.map(w => w.name).join(', ')}`);
      console.log(`💰 Prize per winner: ₹${prizePerWinner}`);
      console.log(`📊 Total pot: ₹${totalPot}`);

      return this.scheduledWinners;
    } catch (err) {
      console.error('❌ Error in Sunday draw:', err.message);
    }
  }

  // Fisher-Yates shuffle algorithm (TRULY RANDOM)
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Send message to member
  async sendMessage(memberId, type, details) {
    try {
      let messageText = '';
      
      if (type === 'WON') {
        messageText = `🎉 Congratulations! You won ₹${details.amount} in Week ${details.week}! You can still pay ₹500 every Sunday to support the fund. Your prize has been added.`;
      } else if (type === 'ANNOUNCEMENT') {
        messageText = `📢 New SUNDAY draw completed! New winners selected for Week ${details.week}. Keep paying ₹500 every Sunday for your chance to win next! 🍀`;
      }

      const message = new Message({
        memberId,
        type,
        message: messageText,
        timestamp: new Date(),
        read: false,
      });

      await message.save();
      return true;
    } catch (err) {
      console.error('Error sending message:', err.message);
      return false;
    }
  }

  // Get scheduled winners (for frontend display)
  getScheduledWinners() {
    return this.scheduledWinners;
  }

  // Mark winners as displayed
  markWinnersDisplayed() {
    if (this.scheduledWinners) {
      this.scheduledWinners.displayed = true;
    }
  }

  // Get next draw time (NEXT SUNDAY at 8 PM)
  getNextDrawTime() {
    const now = new Date();
    let nextDraw = new Date();
    
    // Get next Sunday
    const currentDay = nextDraw.getDay();
    const daysUntilSunday = (7 - currentDay) % 7 || 7;
    nextDraw.setDate(nextDraw.getDate() + daysUntilSunday);
    nextDraw.setHours(20, 0, 0, 0);

    const diff = nextDraw - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      nextDrawTime: nextDraw.toISOString(),
      formattedTime: `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      days,
      hours,
      minutes,
      seconds,
      dayName: 'SUNDAY',
      time: '8:00 PM'
    };
  }

  // Get scheduler stats
  async getAutoDrawStats() {
    const totalWinners = await Winner.countDocuments();
    const currentWeek = Math.floor(totalWinners / 2) + 1;
    const remainingChits = await Member.countDocuments({ chitRemoved: false });
    const totalMembers = await Member.countDocuments();

    return {
      currentWeek,
      totalWinners,
      remainingChits,
      totalMembers,
      membersWon: totalMembers - remainingChits,
      progress: `${((totalMembers - remainingChits) / totalMembers * 100).toFixed(1)}%`,
      schedulerRunning: this.isRunning,
      lastDraw: this.lastDrawTime,
      drawDay: 'SUNDAY',
      drawTime: '8:00 PM',
      scheduledWinners: this.scheduledWinners
    };
  }

  // Manual trigger (for testing)
  async manualTriggerDraw() {
    console.log('🧪 Manual draw triggered (same logic as SUNDAY)');
    return await this.performAutoDraw();
  }
}

// Export singleton
module.exports = new SchedulerService();