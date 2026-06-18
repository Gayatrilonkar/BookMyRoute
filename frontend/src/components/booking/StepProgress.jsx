import React from 'react';

export default function StepProgress({ currentStep = 1, steps = [] }) {
  return (
    <div className="flex items-center justify-center max-w-lg mx-auto w-full mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStep > stepNum;
        const isCurrent = currentStep === stepNum;
        
        return (
          <React.Fragment key={step}>
            {/* Step Node */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-primary border-primary text-white' : 
                    isCurrent ? 'bg-white border-primary text-primary' : 
                    'bg-white border-border-medium text-text-muted'}`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${isCurrent || isCompleted ? 'text-secondary' : 'text-text-muted'}`}>
                {step}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 sm:mx-4 -mt-6 sm:-mt-5 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-border-light'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
