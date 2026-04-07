const { RepoAnalysis, RepoChat } = require('../models'); // Import from your association file
const axios = require('axios');

exports.getUserHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    const history = await RepoAnalysis.findAll({
      include: [{
        model: RepoChat,
        as: 'RepoChats', // Matches the association alias
        attributes: ['role', 'content', 'createdAt']
      }],
      order: [
        ['updatedAt', 'DESC'],
        [{ model: RepoChat, as: 'RepoChats' }, 'createdAt', 'ASC'] // Sort chat messages in order
      ]
    });

    const formattedHistory = history.map(item => {
      const repoUrl = item.repo_url || "";
      const repoName = repoUrl.split('/').pop() || "Repository";
      
      return {
        ...item.toJSON(),
        repo_name: repoName.toUpperCase(),
        // ✅ This array is what the Frontend sidebar uses to load the chat bubbles
        chat_messages: (item.RepoChats || []).map(m => ({
  role: m.role === 'assistant' ? 'ai' : 'user',
  content: m.content
        }))
      };
    });

    res.json(formattedHistory);
  } catch (error) {
    console.error("❌ History Sync Error:", error.message);
    res.status(500).json({ error: "Failed to load history" });
  }
};

exports.analyzeOrChat = async (req, res) => {
  try {
    const repo_url = (req.body.repo_url || "").trim().toLowerCase().replace(/\/$/, "");
    const user_id = req.body.user_id;
    const user_message = req.body.message || "Analyze this repository.";

    // 1. Find the Analysis record - use lowerCase to ensure match
    const [analysis] = await RepoAnalysis.findOrCreate({
      where: { repo_url: repo_url },
      defaults: { summary: { text: "Analysis starting..." } }
    });

    // 2. SAVE THE USER MESSAGE TO DB
    // This was likely missing or failing. We must link it to analysis.id
    await RepoChat.create({
      repo_analysis_id: analysis.id,
      role: 'user',
      content: user_message
    });

    const urlHash = Buffer.from(repo_url).toString('hex').substring(0, 10);
    const thread_id = `repo_${urlHash}_${user_id}`;

    const aiRes = await axios.post(`http://localhost:8000/api/ai/explain`, {
      url: repo_url,
      message: user_message,
      thread_id: thread_id
    });

    const aiResponse = aiRes.data.response;

    // 3. SAVE THE AI MESSAGE TO DB
    await RepoChat.create({
      repo_analysis_id: analysis.id,
      role: 'assistant',
      content: aiResponse
    });

    // 4. Update the summary only if it's the first time
    if (analysis.summary.text === "Analysis starting..." || !req.body.message) {
        await analysis.update({ summary: { text: aiResponse } });
    }
    
    // Update timestamp so it moves to the top of sidebar
    await analysis.update({ updatedAt: new Date() });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "AI Context Failure" });
  }
};