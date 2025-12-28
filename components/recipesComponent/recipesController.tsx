import React, { useState, useEffect } from 'react';
import { recipeInteractionApi } from '@/app/api/(cooking-cntroller)';
import { useAuthStore } from '@/app/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface CookingControllerProps {
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  totalSteps?: number;
  onCookingStatusChange?: (status: 'not_started' | 'started_cooking' | 'cooking_in_progress' | 'completed' | 'didnt_cook') => void;
}

const CookingController: React.FC<CookingControllerProps> = ({ 
  recipeId,
  recipeName,
  recipeImage,
  totalSteps = 0,
  onCookingStatusChange 
}) => {
  const { token, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cookingStatus, setCookingStatus] = useState<'not_started' | 'started_cooking' | 'cooking_in_progress' | 'completed' | 'didnt_cook'>('not_started');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVerifiedCook, setIsVerifiedCook] = useState<boolean>(false);
  const [showCompletionForm, setShowCompletionForm] = useState<boolean>(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [abandonReason, setAbandonReason] = useState<string>('');
  const [cookingTime, setCookingTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cookingProgress, setCookingProgress] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>('00:00:00');

  // Fetch initial cooking status
  useEffect(() => {
    if (recipeId && token) {
      fetchCookingStatus();
    } else {
      setIsLoading(false);
    }
  }, [recipeId, token]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if ((cookingStatus === 'started_cooking' || cookingStatus === 'cooking_in_progress') && startTime) {
      // Initial calculation and setting
      updateFormattedTime();
      
      // Update every second for a smooth timer display
      interval = setInterval(() => {
        updateFormattedTime();
      }, 1000); // update every second
    }
    
    // Function to calculate elapsed time and format it
    function updateFormattedTime() {
      const now = new Date().getTime();
      const elapsed = now - startTime!.getTime();
      
      // Update the cooking time in minutes for backend purposes
      setCookingTime(Math.floor(elapsed / 60000));
      
      // Format time as HH:MM:SS for display
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      setFormattedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cookingStatus, startTime]);

  const fetchCookingStatus = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const status = await recipeInteractionApi.getCookingStatus(recipeId, token);
      setCookingStatus(status.currentStatus);
      setSessionId(status.sessionId);
      setIsVerifiedCook(status.isVerifiedCook);
      
      // If in progress, set start time for timer
      if (status.startedAt && (status.currentStatus === 'started_cooking' || status.currentStatus === 'cooking_in_progress')) {
        setStartTime(new Date(status.startedAt));
        
        // Calculate and format initial time immediately
        const elapsed = new Date().getTime() - new Date(status.startedAt).getTime();
        setCookingTime(Math.floor(elapsed / 60000));
        
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        setFormattedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
      
      if (onCookingStatusChange) {
        onCookingStatusChange(status.currentStatus);
      }
    } catch (error) {
      console.error('Error fetching cooking status:', error);
      toast.error('Failed to fetch cooking status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCooking = async () => {
    if (!token) {
      toast.error('Please log in to track your cooking');
      return;
    }

    setIsLoading(true);
    try {
      const result = await recipeInteractionApi.startCooking(recipeId, { token });
      setCookingStatus(result.status);
      setSessionId(result.sessionId);
      setStartTime(new Date());
      setCookingTime(0);
      toast.success('Let\'s start cooking!', {
        icon: '👨‍🍳',
        duration: 3000
      });
      
      if (onCookingStatusChange) {
        onCookingStatusChange(result.status);
      }
    } catch (error) {
      console.error('Error starting cooking session:', error);
      toast.error('Failed to start cooking session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCooking = async () => {
    if (!token || !recipeId) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await recipeInteractionApi.completeCooking(recipeId, {
        sessionId: sessionId || undefined,
        rating: rating || undefined,
        notes: notes.trim() || undefined,
        cookingTime: cookingTime || undefined,
        token
      });

      setCookingStatus(result.status);
      setIsVerifiedCook(result.isVerifiedCook);
      setShowCompletionForm(false);
      toast.success('Cooking completed! You\'re now a verified cook for this recipe.', {
        icon: '🎉',
        duration: 4000
      });
      
      if (onCookingStatusChange) {
        onCookingStatusChange(result.status);
      }
    } catch (error) {
      console.error('Error completing cooking:', error);
      toast.error('Failed to complete cooking session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandonCooking = async (reason: string) => {
    if (reason != '') {

    if (!token || !recipeId) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await recipeInteractionApi.abandonCooking(recipeId, {
        sessionId: sessionId || undefined,
        reason: abandonReason,
        token
      });

      setCookingStatus(result.status);
      setShowAbandonDialog(false);
      toast.success("We've marked that you didn't cook this recipe");
      
      if (onCookingStatusChange) {
        onCookingStatusChange(result.status);
      }
    } catch (error) {
      console.error('Error abandoning cooking session:', error);
      toast.error('Failed to update cooking status');
    } finally {
      setIsLoading(false);
    }
}
  };

  const handleStepCompletion = async (stepNumber: number) => {
    if (!token || !sessionId) return;
    
    try {
      await recipeInteractionApi.trackStepCompletion(
        recipeId,
        stepNumber,
        { sessionId, token }
      );
      
      setCurrentStep(stepNumber);
      setCookingProgress(Math.min(100, Math.round((stepNumber / totalSteps) * 100)));
      
      if (stepNumber === totalSteps) {
        setShowCompletionForm(true);
      }
    } catch (error) {
      console.error('Error tracking step completion:', error);
    }
  };

  // Format minutes to hours and minutes
  const formatCookingTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading && cookingStatus === 'not_started') {
    return (
      <div className="flex justify-center p-4 sm:p-6 bg-card backdrop-blur-sm rounded-xl border border-border mt-4 sm:mt-6">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-card backdrop-blur-sm rounded-xl border border-border mt-4 sm:mt-6">
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Cooking Tracker</h3>

        {/* Not started state */}
        {cookingStatus === 'not_started' && (
          <div 
            key="not-started"
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="text-center mb-4 sm:mb-6">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">Ready to cook {recipeName}?</h4>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                Track your cooking progress and become a verified cook!
              </p>
              <button
                onClick={handleStartCooking}
                disabled={isLoading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Starting...
                  </div>
                ) : (
                  <>Start Cooking</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cooking in progress state */}
        {(cookingStatus === 'started_cooking' || cookingStatus === 'cooking_in_progress') && (
          <div
            key="cooking"
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
          >
            <div className="bg-primary/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-primary/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <h4 className="text-base sm:text-lg font-medium text-foreground">Cooking in Progress</h4>
                </div>
                <div className="text-xs sm:text-sm text-primary">
                  Time: {formattedTime}
                </div>
              </div>

              {/* Progress bar if tracking steps */}
              {totalSteps > 0 && (
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
                    <span>Step {currentStep}/{totalSteps}</span>
                    <span>{cookingProgress}% complete</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out" 
                      style={{ width: `${cookingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                You're currently cooking this recipe. Mark it as complete when you're done!
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowCompletionForm(true)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base"
                >
                  I'm Done Cooking
                </button>
                <button
                  onClick={() => setShowAbandonDialog(true)}
                  className="px-3 sm:px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-all text-sm sm:text-base"
                >
                  Didn't Cook
                </button>
              </div>
            </div>

            {/* Step tracking UI (if enabled) */}
            {totalSteps > 0 && (
              <div className="mt-3 sm:mt-4">
                <h5 className="text-foreground font-medium mb-2 text-sm sm:text-base">Track Your Progress</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleStepCompletion(index + 1)}
                      className={`p-2 rounded-lg text-center text-xs sm:text-sm transition-all ${
                        index + 1 <= currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Step {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed state */}
        {cookingStatus === 'completed' && (
          <div
            key="completed"
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
          >
            <div className="bg-primary/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-primary/30">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h4 className="text-base sm:text-lg font-medium text-foreground">Recipe Completed!</h4>
              </div>
              
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-primary/20 rounded-full p-1 mr-2 sm:mr-3">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-foreground text-xs sm:text-sm">You're a verified cook for this recipe</span>
              </div>
              
              <button 
                onClick={handleStartCooking}
                className="w-full px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base"
              >
                Cook Again
              </button>
            </div>
          </div>
        )}

        {/* Didn't cook state */}
        {cookingStatus === 'didnt_cook' && (
          <div
            key="didnt-cook"
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
          >
            <div className="bg-muted/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-border">
              <div className="flex items-center mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <h4 className="text-base sm:text-lg font-medium text-foreground">Cooking Canceled</h4>
              </div>
              
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                You marked that you didn't cook this recipe. Would you like to try again?
              </p>
              
              <button 
                onClick={handleStartCooking}
                className="w-full px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base"
              >
                Start Cooking
              </button>
            </div>
          </div>
        )}

      {/* Modal: Completion Form */}
        {showCompletionForm && (
          <div
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowCompletionForm(false)}
          >
            <div
              //{ scale: 0.9, opacity: 0 }}
              // scale: 1, opacity: 1 }}
               //  scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-md border border-border mx-2 sm:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl text-foreground font-bold mb-3 sm:mb-4 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Complete Cooking
              </h3>
              
              {recipeImage && (
                <div className="relative h-24 sm:h-32 rounded-lg overflow-hidden mb-3 sm:mb-4 border border-border">
                  <Image 
                    src={recipeImage} 
                    alt={recipeName} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-2 sm:p-3">
                    <h4 className="text-primary-foreground font-medium text-sm sm:text-base">{recipeName}</h4>
                  </div>
                </div>
              )}
              
              <div className="mb-3 sm:mb-4">
                <p className="text-foreground text-xs sm:text-sm mb-2">How would you rate this recipe?</p>
                <div className="flex items-center gap-1 sm:gap-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none p-0.5 sm:p-1"
                    >
                      <svg
                        className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
                          star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary/50'
                        }`}
                        fill={star <= rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label htmlFor="notes" className="block text-foreground text-xs sm:text-sm mb-2">
                  Cooking Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg p-2 sm:p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base resize-none"
                  placeholder="Share any modifications or tips..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3">
                <button
                  onClick={() => setShowCompletionForm(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteCooking}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>Complete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal: Abandon cooking */}
        {showAbandonDialog && (
          <div
            //{ opacity: 0 }}
            // opacity: 1 }}
             //  opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowAbandonDialog(false)}
          >
            <div
              //{ scale: 0.9, opacity: 0 }}
              // scale: 1, opacity: 1 }}
               //  scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-md border border-border mx-2 sm:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl text-foreground font-bold mb-3 sm:mb-4 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Didn't Cook?
              </h3>
              
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                Let us know why you didn't complete cooking this recipe (optional):
              </p>
              
              <div className="mb-4 sm:mb-6">
                <textarea
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg p-2 sm:p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base resize-none"
                  placeholder="E.g. Missing ingredients, changed plans, etc."
                  value={abandonReason}
                  onChange={(e) => setAbandonReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3">
                <button
                  onClick={() => setShowAbandonDialog(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={()=> handleAbandonCooking(abandonReason)}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-muted text-foreground rounded-lg disabled:opacity-50 hover:bg-muted/80 transition-colors text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-foreground mr-2 inline-block"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Confirm</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CookingController;