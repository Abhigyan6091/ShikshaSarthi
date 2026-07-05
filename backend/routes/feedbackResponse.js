const express = require('express');
const router = express.Router();
const FeedbackResponse = require('../models/FeedbackResponse');
const FeedbackForm = require('../models/FeedbackForm');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Generate unique response ID
const generateResponseId = async () => {
  const count = await FeedbackResponse.countDocuments();
  return `RESP${String(count + 1).padStart(6, '0')}`;
};

// Submit a feedback response as a STUDENT. Mirrors the teacher /submit flow but
// keyed on studentId. Responses go to the school administrator.
router.post('/submit-student', async (req, res) => {
  try {
    const studentId = typeof req.body.studentId === 'string' ? req.body.studentId : '';
    const formId = typeof req.body.formId === 'string' ? req.body.formId : '';
    const { answers } = req.body;

    if (!formId || !studentId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const form = await FeedbackForm.findOne({ formId });
    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    if (String(student.schoolId) !== String(form.schoolId)) {
      return res.status(403).json({ message: 'You cannot submit feedback for this form' });
    }

    const now = new Date();
    if (now < new Date(form.startTime) || now > new Date(form.endTime)) {
      return res.status(403).json({ message: 'This feedback form is not active right now' });
    }

    const existingResponse = await FeedbackResponse.findOne({ formId, studentId });
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted feedback for this form' });
    }

    if (!Array.isArray(answers) || answers.length !== form.questions.length) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    const responseId = await generateResponseId();
    const feedbackResponse = new FeedbackResponse({
      responseId,
      formId,
      studentId,
      respondentRole: 'student',
      schoolId: student.schoolId,
      answers,
    });

    await feedbackResponse.save();

    res.status(201).json({
      message: 'Feedback submitted successfully. It has been sent to your school administrator.',
      feedbackResponse,
    });
  } catch (error) {
    console.error('Error submitting student feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

// Check if a student has already submitted a form.
router.get('/check-student/:formId/:studentId', async (req, res) => {
  try {
    const existing = await FeedbackResponse.findOne({
      formId: req.params.formId,
      studentId: req.params.studentId,
    });
    res.status(200).json({ submitted: Boolean(existing) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check', error: error.message });
  }
});

// Submit a feedback response
router.post('/submit', async (req, res) => {
  try {
    const { formId, teacherId, answers } = req.body;

    // Validate required fields
    if (!formId || !teacherId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if form exists
    const form = await FeedbackForm.findOne({ formId });
    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    // Verify teacher belongs to the same school as the form
    if (teacher.schoolId.toString() !== form.schoolId.toString()) {
      return res.status(403).json({ message: 'You cannot submit feedback for this form' });
    }

    const now = new Date();
    if (now < new Date(form.startTime) || now > new Date(form.endTime)) {
      return res.status(403).json({
        message: 'This feedback form is not active right now'
      });
    }

    // Check if teacher has already submitted this form
    const existingResponse = await FeedbackResponse.findOne({ formId, teacherId });
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted feedback for this form' });
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length !== form.questions.length) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Generate unique response ID
    const responseId = await generateResponseId();

    // Create the feedback response
    const feedbackResponse = new FeedbackResponse({
      responseId,
      formId,
      teacherId,
      schoolId: teacher.schoolId,
      answers
    });

    await feedbackResponse.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackResponse
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

// Check if teacher has already submitted a form
router.get('/check/:formId/:teacherId', async (req, res) => {
  try {
    const { formId, teacherId } = req.params;

    const response = await FeedbackResponse.findOne({ formId, teacherId });

    res.status(200).json({ hasSubmitted: !!response });
  } catch (error) {
    console.error('Error checking feedback submission:', error);
    res.status(500).json({ message: 'Failed to check feedback submission', error: error.message });
  }
});

// Get all responses for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await FeedbackResponse.find({ formId })
      .populate('teacherId', 'name teacherId')
      .sort({ submittedAt: -1 });

    res.status(200).json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error: error.message });
  }
});

// Get feedback analysis for a form
router.get('/analysis/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    // Get the form
    const form = await FeedbackForm.findOne({ formId });
    if (!form) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    // Get all responses for this form
    const responses = await FeedbackResponse.find({ formId });

    // Calculate statistics for each question
    const analysis = form.questions.map((question, questionIndex) => {
      // Count selections for each option
      const optionCounts = question.options.map((option, optionIndex) => {
        const count = responses.filter(response => {
          const answer = response.answers.find(
            a => a.questionId.toString() === question._id.toString()
          );
          return answer && answer.selectedOption === optionIndex;
        }).length;

        return {
          optionText: option.optionText,
          count,
          percentage: responses.length > 0 ? ((count / responses.length) * 100).toFixed(2) : 0
        };
      });

      return {
        questionId: question._id,
        questionText: question.questionText,
        totalResponses: responses.length,
        options: optionCounts
      };
    });

    res.status(200).json({
      formId,
      formTitle: form.title,
      totalResponses: responses.length,
      analysis
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ message: 'Failed to generate analysis', error: error.message });
  }
});

// Get all forms with response counts for a school
router.get('/school/:schoolId/summary', async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Get all forms for the school
    const forms = await FeedbackForm.find({ schoolId }).sort({ createdAt: -1 });

    // Get response counts for each form
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await FeedbackResponse.countDocuments({ formId: form.formId });
        return {
          formId: form.formId,
          title: form.title,
          questionCount: form.questions.length,
          responseCount,
          startTime: form.startTime,
          endTime: form.endTime,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt
        };
      })
    );

    res.status(200).json({ forms: formsWithCounts });
  } catch (error) {
    console.error('Error fetching form summary:', error);
    res.status(500).json({ message: 'Failed to fetch form summary', error: error.message });
  }
});

module.exports = router;
