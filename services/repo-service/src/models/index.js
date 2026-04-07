const RepoAnalysis = require('./RepoAnalysis');
const RepoChat = require('./RepoChat');

// ✅ Define the Relationship
RepoAnalysis.hasMany(RepoChat, { 
  foreignKey: 'repo_analysis_id', 
  as: 'RepoChats' // This alias must match the 'as' in your controller include
});

RepoChat.belongsTo(RepoAnalysis, { 
  foreignKey: 'repo_analysis_id' 
});

module.exports = { RepoAnalysis, RepoChat };