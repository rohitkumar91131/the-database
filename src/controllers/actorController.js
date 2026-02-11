const Actor = require('../models/Actor');

exports.getActors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const actors = await Actor.find(query)
            .sort({ popularity: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Actor.countDocuments(query);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(200).json({ 
                success: true, 
                data: actors, 
                total, 
                page, 
                pages: Math.ceil(total / limit) 
            });
        }

        res.render('actors', {
            title: 'NEXUS - Talent Database',
            path: '/actors',
            actors,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            search
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getActorById = async (req, res) => {
    try {
        const actor = await Actor.findById(req.params.id).lean();
        if (!actor) return res.status(404).send('Actor not found');

        res.render('actorDetail', {
            title: `${actor.name} - NEXUS Profile`,
            path: '/actors',
            actor
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};