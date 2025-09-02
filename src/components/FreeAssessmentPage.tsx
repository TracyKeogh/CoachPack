import React from 'react';
import { useNavigate } from 'react-router-dom';
import FreeWheelAssessment from './FreeWheelAssessment';

const FreeAssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = (results: any) => {
    // Handle completion - could save results or redirect
    console.log('Assessment completed:', results);
    navigate('/dashboard');
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <FreeWheelAssessment 
      onComplete={handleComplete}
      onBackToLanding={handleBackToLanding}
    />
  );
};

export default FreeAssessmentPage;