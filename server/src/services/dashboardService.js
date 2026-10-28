import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';

export const getDashboardMetrics = async (currentUser) => {
  // If user is sales, do we scope or provide sales workspace overview?
  // User prompt: "Dashboard: totals (contacts, open deals, total pipeline value, tasks due today) and a recent activity list"
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalContacts,
    openDealsCount,
    pipelineValueAggregate,
    tasksDueTodayCount,
    recentNotes,
    recentDeals,
  ] = await Promise.all([
    Contact.countDocuments(),
    Deal.countDocuments({ stage: { $in: ['lead', 'qualified', 'proposal'] } }),
    Deal.aggregate([
      { $match: { stage: { $in: ['lead', 'qualified', 'proposal'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]),
    Task.countDocuments({
      status: 'open',
      dueDate: { $gte: startOfDay, $lte: endOfDay },
    }),
    Note.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Deal.find()
      .populate('company', 'name')
      .populate('owner', 'name')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const totalPipelineValue = pipelineValueAggregate[0]?.total || 0;

  // Format activity feed combining recent notes and deal updates
  const recentActivity = recentNotes.map((note) => ({
    id: note._id,
    type: 'note',
    title: `Note posted by ${note.author?.name || 'User'}`,
    description: note.content,
    timestamp: note.createdAt,
    entityType: note.entityType,
    entityId: note.entityId,
  }));

  return {
    metrics: {
      totalContacts,
      openDeals: openDealsCount,
      totalPipelineValue,
      tasksDueToday: tasksDueTodayCount,
    },
    recentActivity,
    recentDeals,
  };
};
