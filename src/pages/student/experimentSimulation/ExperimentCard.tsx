import React from 'react';

interface ExperimentCardProps {
  subject: string;
  description: string;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ subject, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{subject}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ExperimentCard;
