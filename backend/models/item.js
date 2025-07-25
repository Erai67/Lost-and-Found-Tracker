const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const authMiddleware = require('../middleware/authMiddleware');
const stringSimilarity = require('string-similarity');
const mongoose = require('mongoose');

// Match function to find potential matches
const matchItems = async (item, statusToMatch) => {
    const itemsToMatch = await Item.find({ status: statusToMatch });

    return itemsToMatch.filter(i =>
        stringSimilarity.compareTwoStrings(item.name.toLowerCase(), i.name.toLowerCase()) > 0.6 &&
        item.location.toLowerCase() === i.location.toLowerCase()
    );
};

// Report Lost Item
router.post('/lost', authMiddleware, async (req, res) => {
    const { name, description, location, date, image } = req.body;

    try {
        const newItem = new Item({
            name,
            description,
            location,
            date,
            image,
            status: 'lost',
            reportedBy: req.user.userId
        });

        await newItem.save();

        // Match with found items
        const matches = await matchItems(newItem, 'found');

        // Update matches
        if (matches.length > 0) {
            for (const match of matches) {
                await Item.findByIdAndUpdate(newItem._id, {
                    $set: {
                        matchedWith: match._id,
                        matchStatus: 'pending'
                    }
                });
            }
        }

        res.status(201).json({ message: 'Lost item reported', item: newItem, matches });
    } catch (error) {
        res.status(400).json({ message: 'Error reporting lost item', error });
    }
});

// Report Found Item
router.post('/found', authMiddleware, async (req, res) => {
    const { name, description, location, date, image } = req.body;

    try {
        const newItem = new Item({
            name,
            description,
            location,
            date,
            image,
            status: 'found',
            reportedBy: req.user.userId
        });

        await newItem.save();

        // Match with lost items
        const matches = await matchItems(newItem, 'lost');

        // Update lost items with this match
        if (matches.length > 0) {
            for (const match of matches) {
                await Item.findByIdAndUpdate(match._id, {
                    $set: {
                        matchedWith: newItem._id,
                        matchStatus: 'pending'
                    }
                });
        
                await Item.findByIdAndUpdate(newItem._id, {
                    $set: {
                        matchedWith: match._id,
                        matchStatus: 'pending'
                    }
                });
            }
        }

        res.status(201).json({ message: 'Found item reported', item: newItem, matches });
    } catch (error) {
        res.status(400).json({ message: 'Error reporting found item', error });
    }
});

// Get all lost items
router.get('/lost', async (req, res) => {
    try {
        const lostItems = await Item.find({ status: 'lost' });
        res.json(lostItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lost items', error });
    }
});

// Get all found items
router.get('/found', async (req, res) => {
    try {
        const foundItems = await Item.find({ status: 'found' });
        res.json(foundItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching found items', error });
    }
});

// Get matched items for logged-in user
router.get('/matches', authMiddleware, async (req, res) => {
    try {
        const matches = await Item.find({
            reportedBy: req.user.userId,
            matchedWith: { $ne: null },
            matchStatus: 'pending'
        }).populate({
            path: 'matchedWith',
            populate: {
                path: 'reportedBy',
                select: 'username email'
            }
        });

        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matches', error });
    }
});

// Mark match as verified
router.put('/verify/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Item.findOne({
            _id: req.params.id,
            reportedBy: req.user.userId
        });

        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.matchStatus = 'verified';
        await item.save();

        res.json({ message: 'Match verified' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying match', error });
    }
});
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    location: { type: String, required: true },
    date: Date,
    image: {
        type: String,
        default: ''
      },      
    status: {
      type: String,
      enum: ['lost', 'found'],
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matchedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        default: null,
    },      
    matchStatus: {
      type: String,
      enum: ['pending', 'verified', null],
      default: null
    }
  }, { timestamps: true });
module.exports = router;
module.exports = mongoose.model('Item', itemSchema);
