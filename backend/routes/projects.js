const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const PortfolioHero = require('../models/PortfolioHero');

// -- Portfolio Hero Management --

// GET /api/projects/hero
router.get('/hero', async (req, res) => {
    try {
        let hero = await PortfolioHero.findOne();
        if (!hero) {
            hero = await PortfolioHero.create({});
        }
        res.status(200).json(hero);
    } catch (error) {
        console.error('Fetch Portfolio Hero Error:', error);
        res.status(500).json({ message: 'Failed to fetch portfolio hero' });
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
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json({ projects });
    } catch (error) {
        console.error('Fetch Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        console.error('Fetch Single Project Error:', error);
        res.status(500).json({ message: 'Failed to fetch project' });
    }
});

// POST /api/projects - Create project (Admin)
router.post('/', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ message: 'Failed to create project' });
    }
});

// PUT /api/projects/:id - Update project (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id - Delete project (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ message: 'Failed to delete project' });
    }
});

module.exports = router;

// trigger nodemon restart
