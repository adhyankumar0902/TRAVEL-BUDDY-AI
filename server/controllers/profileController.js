const User = require('../models/User');

// Helper to calculate profile completion percentage and find missing fields dynamically
const calculateProfileCompletion = (user) => {
  const checkFields = [
    { name: 'name', label: 'Add Name', check: (u) => u.name && u.name.trim() !== '' },
    { name: 'bio', label: 'Add Bio', check: (u) => u.bio && u.bio.trim() !== '' },
    { name: 'location', label: 'Add Location', check: (u) => u.location && u.location.trim() !== '' },
    { name: 'languages', label: 'Add Languages', check: (u) => u.languages && u.languages.length > 0 },
    { name: 'travelStyle', label: 'Add Travel Style', check: (u) => u.travelStyle && u.travelStyle.trim() !== '' },
    { name: 'interests', label: 'Add Interests', check: (u) => u.interests && u.interests.length > 0 },
    { name: 'age', label: 'Add Age', check: (u) => u.age !== undefined && u.age !== null },
    { name: 'gender', label: 'Add Gender', check: (u) => u.gender && u.gender.trim() !== '' }
  ];

  let completedCount = 0;
  const missingFields = [];

  checkFields.forEach((field) => {
    if (field.check(user)) {
      completedCount++;
    } else {
      missingFields.push(field.label);
    }
  });

  const percentage = Math.round((completedCount / checkFields.length) * 100);
  return { percentage, missingFields };
};

// @desc    Get logged in user's profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { percentage, missingFields } = calculateProfileCompletion(user);

    // Return profile with dynamic completion info
    res.json({
      ...user.toObject(),
      profileCompletionPercentage: percentage,
      missingFields
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update logged in user's profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { bio, age, gender, location, languages, travelStyle, interests } = req.body;

    // 1. Validation checks
    // Bio validation
    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ message: 'Bio must be a string' });
      }
      if (bio.length > 300) {
        return res.status(400).json({ message: 'Bio cannot exceed 300 characters' });
      }
      user.bio = bio;
    }

    // Age validation
    if (age !== undefined && age !== null && age !== '') {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        return res.status(400).json({ message: 'Age must be a positive number' });
      }
      user.age = parsedAge;
    } else if (age === null || age === '') {
      user.age = undefined; // clear age
    }

    // Gender validation
    if (gender !== undefined) {
      const allowedGenders = ['Male', 'Female', 'Prefer not to say'];
      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({ message: 'Invalid gender value' });
      }
      user.gender = gender;
    }

    // Location validation
    if (location !== undefined) {
      user.location = location;
    }

    // Languages validation
    if (languages !== undefined) {
      if (!Array.isArray(languages)) {
        return res.status(400).json({ message: 'Languages must be an array of strings' });
      }
      user.languages = languages;
    }

    // Travel Style validation
    if (travelStyle !== undefined && travelStyle !== '') {
      const allowedTravelStyles = [
        'Adventure', 'Backpacking', 'Luxury', 'Road Trip', 
        'Camping', 'Solo', 'Family', 'Business'
      ];
      if (!allowedTravelStyles.includes(travelStyle)) {
        return res.status(400).json({ message: 'Invalid travel style value' });
      }
      user.travelStyle = travelStyle;
    } else if (travelStyle === '') {
      user.travelStyle = undefined; // clear travel style
    }

    // Interests validation
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return res.status(400).json({ message: 'Interests must be an array of strings' });
      }
      user.interests = interests;
    }

    // 2. Save the updated user object
    await user.save();

    // Fetch updated user from DB without password
    const updatedUser = await User.findById(req.user._id).select('-password');
    const { percentage, missingFields } = calculateProfileCompletion(updatedUser);

    res.json({
      ...updatedUser.toObject(),
      profileCompletionPercentage: percentage,
      missingFields
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    View another user's public profile
// @route   GET /api/profile/:id
// @access  Private
const getPublicProfile = async (req, res) => {
  try {
    // Return only public profile fields: name, profileImage, bio, age, gender, location, languages, travelStyle, interests, createdAt, updatedAt
    const user = await User.findById(req.params.id)
      .select('name profileImage bio age gender location languages travelStyle interests createdAt updatedAt');

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { percentage, missingFields } = calculateProfileCompletion(user);

    res.json({
      ...user.toObject(),
      profileCompletionPercentage: percentage,
      missingFields
    });
  } catch (error) {
    console.error('Get Public Profile Error:', error);
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(500).json({ message: 'Server error retrieving public profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile
};
