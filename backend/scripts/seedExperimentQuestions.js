const mongoose = require('mongoose');
const ExperimentQuestion = require('../models/ExperimentQuestion');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const questions = [
  // Vernier Caliper
  {
    experimentName: "Vernier Caliper Measurements",
    subject: "Physics",
    class: "11",
    topic: "Measurement",
    question: "What is the least count of a standard Vernier Caliper?",
    options: ["0.1 mm", "0.01 mm", "0.02 mm", "1 mm"],
    correctAnswer: "0.1 mm",
    explanation: "Standard Vernier callipers usually have a least count of 0.1mm."
  },
  {
    experimentName: "Vernier Caliper Measurements",
    subject: "Physics",
    class: "11",
    topic: "Measurement",
    question: "Which formula is used to calculate the total reading in a Vernier Caliper?",
    options: ["MSR + (VSR x LC)", "MSR - (VSR x LC)", "MSR / (VSR x LC)", "MSR x (VSR + LC)"],
    correctAnswer: "MSR + (VSR x LC)",
    explanation: "Total Reading = Main Scale Reading (MSR) + (Vernier Scale Reading (VSR) x Least Count (LC))."
  },
  // Simple Pendulum
  {
    experimentName: "Simple Pendulum Experiment",
    subject: "Physics",
    class: "11",
    topic: "Oscillations",
    question: "The time period of a simple pendulum is independent of:",
    options: ["Length of the string", "Mass of the bob", "Acceleration due to gravity", "Length and Gravity"],
    correctAnswer: "Mass of the bob",
    explanation: "For small amplitudes, the period of a simple pendulum depends only on its length and the acceleration due to gravity, not on the mass of the bob."
  },
   {
    experimentName: "Simple Pendulum Experiment",
    subject: "Physics",
    class: "11",
    topic: "Oscillations",
    question: "If length is increased by 4 times, time period becomes:",
    options: ["4 times", "2 times", "Half", "Same"],
    correctAnswer: "2 times",
    explanation: "T is proportional to square root of L. So if L becomes 4L, T becomes 2T."
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Clearing old experiment questions...');
    await ExperimentQuestion.deleteMany({}); // clear old questions
    console.log('Seeding new experiment questions...');
    await ExperimentQuestion.insertMany(questions);
    console.log('Experiment questions seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
  });
