exports.renderDocs = (req, res) => {
    res.render('docs', {
        title: 'NEXUS - Developer Portal',
        path: '/docs',
        baseUrl: `${req.protocol}://${req.get('host')}`
    });
};