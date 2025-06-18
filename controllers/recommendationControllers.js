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
            ai: ['ai', 'artificial intelligence', 'ml', 'machine learning'],
            web: ['web', 'html', 'css', 'javascript', 'react'],
            app: ['app', 'android', 'ios', 'mobile'],
            cybersecurity: ['cyber', 'security', 'hacking', 'ctf'],
            data: ['data', 'data science', 'analytics'],
            cloud: ['cloud', 'aws', 'azure', 'gcp'],
            robotics: ['robot', 'robotics', 'automation'],
            iot: ['iot', 'internet of things'],
            blockchain: ['blockchain', 'crypto', 'ethereum'],
            aiml: ['ai', 'ml', 'machine learning', 'artificial intelligence'], 
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

        let matchedCompetitions = await Competition.find({ $or: regexConditions });

        if (matchedCompetitions.length === 0) {
            matchedCompetitions = await Competition.find({})
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
