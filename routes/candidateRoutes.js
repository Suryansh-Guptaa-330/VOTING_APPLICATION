const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const { jwtAuthMiddleware } = require('./../jwt');

// Helper function to check admin role
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// 1. GET: List of all candidates (public)
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party age voteCount _id');
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. GET: Live vote counts (sorted descending)
// Placed BEFORE /:candidateID routes to prevent route collision
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });

        const voteRecord = candidates.map((data) => {
            return {
                id: data._id,
                name: data.name,
                party: data.party,
                count: data.voteCount,
                age: data.age
            };
        });
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. POST: Add candidate (Admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Candidate data saved');
        res.status(200).json({ response: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 4. PUT: Update candidate (Admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 5. DELETE: Delete candidate (Admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. POST: Cast a vote
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin cannot vote' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // candidate.votes.push({ user: userId });
        // candidate.voteCount++;
        // await candidate.save();

        //atomic updates because of concurrency issue in voting so we use this 
       await Candidate.findByIdAndUpdate(candidateID, {
    $inc: { voteCount: 1 },
    $push: { votes: { user: userId } }
});
    

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
