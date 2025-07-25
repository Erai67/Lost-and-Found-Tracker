const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const authMiddleware = require('../middleware/authMiddleware');
const stringSimilarity = require('string-similarity');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');
const app = express();
const LostItem = require('../models/item'); // Adjust the path as needed

// Storage config - save images to /uploads folder with unique name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
  });
  
const upload = multer({ storage });

// Make sure your server serves files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Helper function to find potential matches for a given item and status ('lost' or 'found')
const matchItems = async (item, statusToMatch) => {
  const itemsToMatch = await Item.find({ status: statusToMatch });

  return itemsToMatch.filter(i =>
    stringSimilarity.compareTwoStrings(item.name.toLowerCase(), i.name.toLowerCase()) > 0.6 &&
    item.location.toLowerCase() === i.location.toLowerCase()
  );
};

// Report Lost Item
router.post('/lost', authMiddleware, upload.single('image'), async (req, res) => {
    try {
      const { name, description, location, date } = req.body;
      const image = req.file ? req.file.filename : null;
  
      if (!name || !location) {
        return res.status(400).json({ message: 'Name and location are required.' });
      }
  
      const newItem = new Item({
        name,
        description,
        location,
        date,
        image,
        status: 'lost',
        reportedBy: req.user.userId,
        matchStatus: null,
        matchedWith: null,
      });
  
      await newItem.save();
  
      // Match with found items
      const matches = await matchItems(newItem, 'found');
      if (matches.length > 0) {
        const firstMatch = matches.find(item => !item.matchedWith);
        if (firstMatch) {
          newItem.matchedWith = firstMatch._id;
          newItem.matchStatus = 'pending';
          await newItem.save();
  
          firstMatch.matchedWith = newItem._id;
          firstMatch.matchStatus = 'pending';
          await firstMatch.save();
        }
      }
  
      res.status(201).json({ message: 'Lost item reported', item: newItem, matches });
    } catch (error) {
      console.error('Error reporting lost item:', error);
      res.status(500).json({ message: 'Error reporting lost item', error: error.message });
    }
  });
  

// Report Found Itemconst upload = multer({ storage });
// Report Found Item (with image upload)
router.post('/found', authMiddleware, upload.single('image'), async (req, res) => {
    try {
      const { name, description, location, date } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : '';
  
      if (!name || !location) {
        return res.status(400).json({ message: 'Name and location are required.' });
      }
  
      const newItem = new Item({
        name,
        description,
        location,
        date,
        image,
        status: 'found',
        reportedBy: req.user.userId,
        matchStatus: null,
        matchedWith: null,
      });
  
      await newItem.save();
  
      // Match with lost items
      const matches = await matchItems(newItem, 'lost');
      if (matches.length > 0) {
        const firstMatch = matches.find(item => !item.matchedWith);
        if (firstMatch) {
          newItem.matchedWith = firstMatch._id;
          newItem.matchStatus = 'pending';
          await newItem.save();
  
          firstMatch.matchedWith = newItem._id;
          firstMatch.matchStatus = 'pending';
          await firstMatch.save();
        }
      }
  
      res.status(201).json({ message: 'Found item reported', item: newItem, matches });
    } catch (error) {
      console.error('Error reporting found item:', error);
      res.status(500).json({ message: 'Error reporting found item', error: error.message });
    }
  });
  
  
// Get all lost items for logged-in user only
router.get('/lost', authMiddleware, async (req, res) => {
    try {
      const lostItems = await Item.find({ status: 'lost', reportedBy: req.user.userId })
        .populate({
          path: 'matchedWith',
          select: 'name description location image reportedBy', // ✅ Include 'image'
          populate: {
            path: 'reportedBy',
            select: 'username email'
          }
        });
        console.log('Lost Items:', lostItems);
      res.json(lostItems);
    } catch (error) {
      console.error('Error fetching lost items:', error);
      res.status(500).json({ message: 'Error fetching lost items', error: error.message });
    }
  });
  
// Get all found items for logged-in user only
router.get('/found', authMiddleware, async (req, res) => {
  try {
    const foundItems = await Item.find({ status: 'found', reportedBy: req.user.userId });
    res.json(foundItems);
  } catch (error) {
    console.error('Error fetching found items:', error);
    res.status(500).json({ message: 'Error fetching found items', error: error.message });
  }
});

// Get matched items for logged-in user (only pending matches)
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
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
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
  
      // Mark the current item as verified
      item.matchStatus = 'verified';
      await item.save();
  
      // Also mark the matched item (other user's item) as verified
      if (item.matchedWith) {
        const matchedItem = await Item.findById(item.matchedWith);
        if (matchedItem) {
          matchedItem.matchStatus = 'verified';
          await matchedItem.save();
        }
      }
  
      res.json({ message: 'Match verified' });
    } catch (error) {
      console.error('Error verifying match:', error);
      res.status(500).json({ message: 'Error verifying match', error: error.message });
    }
  });
  
router.put('/reject/:id', async (req, res) => {
    try {
      const item = await LostItem.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
  
      item.matchedWith = null;
      item.matchStatus = 'pending'; // Optional: reset match status
      await item.save();
  
      res.json({ message: 'Match rejected' });
    } catch (err) {
      console.error('Reject match error:', err);
      res.status(500).json({ message: 'Failed to reject match' });
    }
  });
  
router.delete('/lost/:id', authMiddleware, async (req, res) => {
    try {
      const item = await Item.findOne({
        _id: req.params.id,
        reportedBy: req.user.userId,
        status: 'lost'
      });
  
      if (!item) {
        return res.status(404).json({ message: 'Lost item not found or not authorized' });
      }
  
  
      await item.deleteOne();  // <-- changed from remove()
  
      res.json({ message: 'Lost item deleted successfully' });
    } catch (error) {
      console.error('Error deleting lost item:', error);
      res.status(500).json({ message: 'Error deleting lost item', error: error.message });
    }
  });
  
  

// Update lost item by ID (owner only and only if not verified)
router.put('/lost/:id', authMiddleware, upload.single('image'), async (req, res) => {
    const { name, description, location, date } = req.body;
  
    try {
      const item = await Item.findOne({
        _id: req.params.id,
        reportedBy: req.user.userId,
        status: 'lost'
      });
  
      if (!item) {
        return res.status(404).json({ message: 'Lost item not found or not authorized' });
      }
  
      if (item.matchStatus === 'verified') {
        return res.status(400).json({ message: 'Cannot update after verification' });
      }
  
      // Update fields if provided
      item.name = name || item.name;
      item.description = description || item.description;
      item.location = location || item.location;
      item.date = date || item.date;
  
      // If image file uploaded, save its path
      if (req.file) {
        item.image = `/uploads/${req.file.filename}`;
      }
  
      await item.save();
  
      res.json({ message: 'Lost item updated', item });
    } catch (error) {
      console.error('Error updating lost item:', error);
      res.status(500).json({ message: 'Error updating lost item', error: error.message });
    }
  });
  
// Get dashboard data for logged-in user (lost items + their matches)
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
      const lostItems = await Item.find({
        reportedBy: req.user.userId,
        status: 'lost',
      }).populate({
        path: 'matchedWith',
        populate: {
          path: 'reportedBy',
          select: 'username email',
        }
      });
  
      res.json({ lostItems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching items' });
    }
  });
    
  router.get('/test-verified', async (req, res) => {
    const items = await Item.find({ matchStatus: 'verified' }).populate({
      path: 'matchedWith',
      populate: { path: 'reportedBy', select: 'username email' }
    });
  
    res.json(items);
  });
  
  // Get all lost items from all users
router.get('/all-lost', async (req, res) => {
    try {
      const lostItems = await Item.find({ status: 'lost' })
        .populate('reportedBy', 'username email'); // Optional: show reporter info
      res.json(lostItems);
    } catch (error) {
      console.error('Error fetching all lost items:', error);
      res.status(500).json({ message: 'Error fetching lost items', error: error.message });
    }
  });
  
  // Get all found items from all users
  router.get('/all-found', async (req, res) => {
    try {
      const foundItems = await Item.find({ status: 'found' })
        .populate('reportedBy', 'username email');
      res.json(foundItems);
    } catch (error) {
      console.error('Error fetching all found items:', error);
      res.status(500).json({ message: 'Error fetching found items', error: error.message });
    }
  });
  
module.exports = router;
