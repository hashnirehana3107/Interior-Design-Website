const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const PortfolioHero = require('../models/PortfolioHero');
const { getCache, setCache, clearCache, getOrRevalidate } = require('../utils/cache');
const { optimizeProjectImages } = require('../utils/optimizeProjectImages');

// -- Portfolio Hero Management --

// GET /api/projects/hero
router.get('/hero', async (req, res) => {
    try {
        const hero = await getOrRevalidate('projects_hero', async () => {
            let item = await PortfolioHero.findOne().lean();
            if (!item) item = await PortfolioHero.create({});
            return item;
        }, 300);
        res.status(200).json(hero);
    } catch (error) {
        console.error('Fetch Portfolio Hero Error:', error);
        res.status(200).json({ kicker: 'OUR PORTFOLIO', title: 'Curated Works' });
    }
});

// PUT /api/projects/hero
router.put('/hero', async (req, res) => {
    try {
        let hero = await PortfolioHero.findOne();
        if (!hero) {
            hero = new PortfolioHero(req.body);
            await hero.save();
        } else {
            hero = await PortfolioHero.findByIdAndUpdate(hero._id, { $set: req.body }, { new: true });
        }
        clearCache('projects');
        res.status(200).json({ message: 'Portfolio hero updated successfully', hero });
    } catch (error) {
        console.error('Update Portfolio Hero Error:', error);
        res.status(500).json({ message: 'Failed to update portfolio hero' });
    }
});


// -- Projects Management --

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ order: 1, _id: -1 })
            .select('-beforeImg -afterImg -galleryImages')
            .lean();

        res.status(200).json({ projects: projects || [] });
    } catch (error) {
        console.error('Fetch Projects Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch projects', projects: [] });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        // Skip cache when ?t= (timestamp/cache-buster) param is present - used by Admin Edit button
        const skipCache = !!req.query.t;
        if (!skipCache) {
            const cached = getCache(`project_${req.params.id}`);
            if (cached) return res.status(200).json(cached);
        }

        const project = await Project.findById(req.params.id).lean();
        if (!project) return res.status(404).json({ message: 'Project not found' });
        setCache(`project_${req.params.id}`, project, 300);
        res.status(200).json(project);
    } catch (error) {
        console.error('Fetch Single Project Error:', error);
        res.status(500).json({ message: 'Failed to fetch project' });
    }
});

// POST /api/projects - Create project (Admin)
router.post('/', async (req, res) => {
    try {
        const projectData = await optimizeProjectImages(req.body);
        const newProject = new Project(projectData);
        await newProject.save();

        const obj = newProject.toObject();
        const current = getCache('projects_list');
        let existing = current && current.projects ? current.projects : (Array.isArray(current) ? current : []);
        let list = [...existing];
        list.unshift(obj);
        setCache('projects_list', { projects: list }, 300);

        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ message: 'Failed to create project' });
    }
});

// PUT /api/projects/:id - Update project (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;

        const projectData = await optimizeProjectImages(updateData);
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: projectData },
            { new: true, runValidators: true }
        );
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });

        const obj = updatedProject.toObject();
        setCache(`project_${req.params.id}`, obj, 300);

        const current = getCache('projects_list');
        let existing = current && current.projects ? current.projects : (Array.isArray(current) ? current : null);
        if (existing) {
            const list = existing.map(p => String(p._id) === String(req.params.id) ? obj : p);
            setCache('projects_list', { projects: list }, 300);
        } else {
            clearCache('projects');
        }

        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update project' });
    }
});

// DELETE /api/projects/:id - Delete project (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        clearCache(`project_${req.params.id}`);

        const current = getCache('projects_list');
        let existing = current && current.projects ? current.projects : (Array.isArray(current) ? current : null);
        if (existing) {
            const list = existing.filter(p => String(p._id) !== String(req.params.id));
            setCache('projects_list', { projects: list }, 300);
        } else {
            clearCache('projects');
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ message: 'Failed to delete project' });
    }
});

module.exports = router;

// trigger nodemon restart
