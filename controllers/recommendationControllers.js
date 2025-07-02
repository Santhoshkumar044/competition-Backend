export const recommendCompetitions = async (req, res) => {
  try {
    const userId = req.params.id;
    const { Profile, Competition } = req.models;

    const userProfile = await Profile.findById(userId);
    if (!userProfile || !userProfile.domain) {
      return res.status(404).json({ message: "User profile or domain not found" });
    }

    const inputDomain = userProfile.domain.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ' ');

    const domainKeywordsMap = {
      ai: ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning', 'neural networks', 'natural language processing', 'computer vision'],
      web: ['web', 'html', 'css', 'javascript', 'react', 'frontend','backend', 'fullstack', 'web development', 'web design', 'web app', 'web application', 'web dev', 'webapp development'],
      app: ['app', 'android', 'ios', 'mobile', 'mobile app', 'mobile application', 'mobile development', 'mobile dev'],
      cybersecurity: ['cyber', 'security', 'hacking', 'ctf', 'penetration testing', 'ethical hacking', 'cybersecurity', 'infosec', 'information security'],
      data: ['data', 'data science', 'analytics', 'big data', 'data analysis', 'data engineering', 'data visualization', 'data mining'],
      cloud: ['cloud', 'aws', 'azure', 'gcp', 'cloud computing', 'cloud services', 'cloud architecture', 'cloud development', 'cloud engineering', 'cloud infrastructure'],
      robotics: ['robot', 'robotics', 'automation', 'drones', 'robotic systems', 'robotic engineering', 'robotic development', 'robotic technology', 'robotic applications'],
      iot: ['iot', 'internet of things', 'embedded systems', 'smart devices', 'connected devices', 'iot development', 'iot applications', 'iot solutions', 'iot technology'],
      blockchain: ['blockchain', 'crypto', 'ethereum', 'bitcoin', 'decentralized', 'smart contracts', 'dapps', 'distributed ledger', 'cryptocurrency'],
      aiml: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'deep learning', 'neural networks', 'natural language processing', 'computer vision']
    };

    let matchedCategory = null;
    for (const [category, keywords] of Object.entries(domainKeywordsMap)) {
      if (keywords.some(keyword => inputDomain.includes(keyword.toLowerCase()))) {
        matchedCategory = category;
        break;
      }
    }

    const keywordsToSearch = matchedCategory ? domainKeywordsMap[matchedCategory] : [inputDomain];

    const regexConditions = keywordsToSearch.map(keyword => ({
      title: { $regex: keyword, $options: 'i' }
    }));

    // ✅ Only fetch approved competitions
    let matchedCompetitions = await Competition.find({
      status: 'approved',
      $or: regexConditions
    });

    if (matchedCompetitions.length === 0) {
      matchedCompetitions = await Competition.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        message: `No matches found for '${userProfile.domain}'. Showing recent competitions instead.`,
        fallback: true,
        count: matchedCompetitions.length,
        data: matchedCompetitions
      });
    }

    return res.status(200).json({
      message: `Recommended competitions based on interest domain: ${userProfile.domain}`,
      fallback: false,
      count: matchedCompetitions.length,
      data: matchedCompetitions
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
