const Roadmap = require('../models/Roadmap');
const axios = require('axios');

// 1. Generate or Get from Cache (Discovery Mode)
exports.getOrGenerate = async (req, res) => {
  try {
    const { target, user_id } = req.body;
    let existing = await Roadmap.findOne({ where: { user_id, goal: target } });
    
    if (existing) {
      return res.json({ source: 'database', data: existing.roadmap_data });
    }

    const aiResponse = await axios.post(`http://localhost:8000/api/ai/generate`, { target });
    const roadmapObject = aiResponse.data.roadmap || aiResponse.data.final_roadmap;

    const newEntry = await Roadmap.create({
      user_id,
      goal: target,
      roadmap_data: roadmapObject,
      status: 'discovery' // Ensure it starts as discovery
    });

    res.json({ source: 'ai-engine', data: newEntry.roadmap_data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Activate Roadmap (Move to Collection)
exports.activateRoadmap = async (req, res) => {
  try {
    const { user_id, goal } = req.body;
    const roadmap = await Roadmap.findOne({ where: { user_id, goal } });

    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

    roadmap.status = 'active';
    await roadmap.save();
    res.json({ message: "Activated", roadmap_id: roadmap.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Single Roadmap (For the Live/Active Page)
exports.getSingleRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findByPk(req.params.id);
    if (!roadmap) return res.status(404).json({ error: "Not found" });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Progress (Checkboxes)
exports.updateProgress = async (req, res) => {
  try {
    const { roadmap_id, completed_steps } = req.body;
    const roadmap = await Roadmap.findByPk(roadmap_id);
    if (!roadmap) return res.status(404).json({ error: "Not found" });

    roadmap.completed_steps = completed_steps;
    await roadmap.save();
    res.json({ message: "Progress updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Get User Collection
exports.getMyCollection = async (req, res) => {
  try {
    const { user_id } = req.params;
    const collection = await Roadmap.findAll({ 
      where: { user_id, status: 'active' },
      order: [['created_at', 'DESC']]
    });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};