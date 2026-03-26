const express = require('express');
const router = express.Router();
const FeedbackForm = require('../models/FeedbackForm');
const FeedbackResponse = require('../models/FeedbackResponse');
const SchoolAdmin = require('../models/SchoolAdmin');

// Create a new feedback form
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      schoolId,
      questions,
      createdBy,
      formId: customFormId,
      startTime,
      endTime
    } = req.body;

    // Validate required fields
    if (!title || !schoolId || !questions || !createdBy || !customFormId || !customFormId.trim() || !startTime || !endTime) {
      return res.status(400).json({
        message: 'Form ID, title, school ID, questions, creator, start time, and end time are required'
      });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (Number.isNaN(parsedStartTime.getTime()) || Number.isNaN(parsedEndTime.getTime())) {
      return res.status(400).json({ message: 'Start time and end time must be valid dates' });
    }

    if (parsedStartTime >= parsedEndTime) {
      return res.status(400).json({ message: 'End time must be later than start time' });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions must be a non-empty array' });
    }

    // Validate each question has options
    for (const question of questions) {
      if (!question.questionText || !Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({
          message: 'Each question must have text and at least 2 options'
        });
      }
    }

    // Verify school admin belongs to the school
    const admin = await SchoolAdmin.findOne({ username: createdBy });
    if (!admin) {
      return res.status(404).json({ message: 'School admin not found' });
    }

    if (admin.schoolId.toString() !== schoolId) {
      return res.status(403).json({ message: 'School admin does not belong to this school' });
    }

    const formId = customFormId.trim();

    // Check if custom formId already exists
    const existingForm = await FeedbackForm.findOne({ formId });
    if (existingForm) {
      return res.status(400).json({ message: 'Form ID already exists. Please choose a different ID.' });
    }

    // Create the feedback form
    const feedbackForm = new FeedbackForm({
      formId,
      title,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      schoolId,
      questions,
      createdBy
    });

    await feedbackForm.save();

    res.status(201).json({
      message: 'Feedback form created successfully',
      feedbackForm
    });
  } catch (error) {
    console.error('Error creating feedback form:', error);
    res.status(500).json({ message: 'Failed to create feedback form', error: error.message });
  }
});

// Get all feedback forms for a school
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;

    const forms = await FeedbackForm.find({ schoolId }).sort({ createdAt: -1 });

    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error fetching feedback forms:', error);
    res.status(500).json({ message: 'Failed to fetch feedback forms', error: error.message });
  }
});

// Get a single feedback form by ID
router.get('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await FeedbackForm.findOne({ formId });

    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    res.status(200).json({ form });
  } catch (error) {
    console.error('Error fetching feedback form:', error);
    res.status(500).json({ message: 'Failed to fetch feedback form', error: error.message });
  }
});

// Update a feedback form
router.put('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { title, questions, startTime, endTime } = req.body;

    const form = await FeedbackForm.findOne({ formId });

    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    // Check if form has any responses
    const responseCount = await FeedbackResponse.countDocuments({ formId });
    if (responseCount > 0) {
      return res.status(403).json({
        message: 'Cannot edit form that already has responses'
      });
    }

    let parsedStartTime = form.startTime;
    let parsedEndTime = form.endTime;

    if (startTime) {
      parsedStartTime = new Date(startTime);
      if (Number.isNaN(parsedStartTime.getTime())) {
        return res.status(400).json({ message: 'Start time must be a valid date' });
      }
    }

    if (endTime) {
      parsedEndTime = new Date(endTime);
      if (Number.isNaN(parsedEndTime.getTime())) {
        return res.status(400).json({ message: 'End time must be a valid date' });
      }
    }

    if (parsedStartTime >= parsedEndTime) {
      return res.status(400).json({ message: 'End time must be later than start time' });
    }

    // Validate questions if provided
    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Questions must be a non-empty array' });
      }

      for (const question of questions) {
        if (!question.questionText || !Array.isArray(question.options) || question.options.length < 2) {
          return res.status(400).json({
            message: 'Each question must have text and at least 2 options'
          });
        }
      }

      form.questions = questions;
    }

    if (title) {
      form.title = title;
    }

    form.startTime = parsedStartTime;
    form.endTime = parsedEndTime;

    form.updatedAt = Date.now();
    await form.save();

    res.status(200).json({
      message: 'Feedback form updated successfully',
      form
    });
  } catch (error) {
    console.error('Error updating feedback form:', error);
    res.status(500).json({ message: 'Failed to update feedback form', error: error.message });
  }
});

// Delete a feedback form
router.delete('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await FeedbackForm.findOne({ formId });

    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    // Check if form has any responses
    const responseCount = await FeedbackResponse.countDocuments({ formId });
    if (responseCount > 0) {
      return res.status(403).json({
        message: 'Cannot delete form that has responses'
      });
    }

    await FeedbackForm.findOneAndUpdate(
      { formId },
      { isDeleted: true },
      { includeDeleted: true }
    );

    res.status(200).json({ message: 'Feedback form deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback form:', error);
    res.status(500).json({ message: 'Failed to delete feedback form', error: error.message });
  }
});

// Get forms available for a teacher (not yet attempted)
router.get('/available/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const now = new Date();

    // Get teacher's school
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get all forms for the school
    const allForms = await FeedbackForm.find({
      schoolId: teacher.schoolId,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ startTime: 1, createdAt: -1 });

    // Get forms already attempted by this teacher
    const attemptedForms = await FeedbackResponse.find({ teacherId }).distinct('formId');

    // Filter out attempted forms
    const availableForms = allForms.filter(form => !attemptedForms.includes(form.formId));

    res.status(200).json({ forms: availableForms });
  } catch (error) {
    console.error('Error fetching available forms:', error);
    res.status(500).json({ message: 'Failed to fetch available forms', error: error.message });
  }
});

module.exports = router;
