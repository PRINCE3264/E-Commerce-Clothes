const Team = require('../models/Team');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res) => {
    try {
        const team = await Team.find().sort({ displayOrder: 1 });
        res.status(200).json({ success: true, count: team.length, data: team });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
const getTeamMemberById = async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid ID or Error" });
    }
};

// @desc    Create team member
// @route   POST /api/admin/team
// @access  Private/Admin
const createTeamMember = async (req, res) => {
    try {
        const member = await Team.create(req.body);
        res.status(201).json({ success: true, data: member });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update team member
// @route   PUT /api/admin/team/:id
// @access  Private/Admin
const updateTeamMember = async (req, res) => {
    try {
        const member = await Team.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete team member
// @route   DELETE /api/admin/team/:id
// @access  Private/Admin
const deleteTeamMember = async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        await member.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    getTeamMembers,
    getTeamMemberById,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
};
