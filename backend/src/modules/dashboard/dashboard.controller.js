const dashboardService = require('./dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user.role, req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
