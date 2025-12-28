import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, Check, X, Clock, AlertCircle, FileText, BarChart2 } from "lucide-react";
import { connectMealPlanToGoogleCalendar, disconnectMealPlanFromGoogleCalendar } from "@/app/api/(meal-planner)/googleMealPlanner";
import SyncCalendarButton from "./syncCalendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Google API client ID
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface SavedPlan {
  id: string;
  name: string;
  date: Date;
  plan: any;
  notes?: string;
  connectedToCalendar?: boolean;
  calendarConnectionDate?: string;
}

interface SavedPlanDetailsModalProps {
  plan: SavedPlan;
  countMeals: (plan: any) => number;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoad: (plan: SavedPlan) => void;
  id: string; // Meal plan ID
}

// Define the Google Identity Services interface
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (options?: { prompt?: string }) => Promise<any>;
          };
        }
      };
    };
  }
}

const TestUserInfo = () => (
  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
    <h4 className="text-sm font-medium text-primary flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      Testing Project Information
    </h4>
    <p className="text-xs text-muted-foreground mt-1">
      This project uses Google Calendar integration in test mode. Only approved Google accounts can connect.
    </p>
    <div className="mt-2 flex">
      <a 
        href="mailto:owoadehabeeb04@gmail.com" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 flex-grow text-center transition-colors"
      >
        Request Access for Your Google Account
      </a>
    </div>
  </div>
);

export const SavedPlanDetailsModal: React.FC<SavedPlanDetailsModalProps> = ({
  plan,
  countMeals,
  onClose,
  onViewDetails,
  onDelete,
  onDuplicate,
  onLoad,
  id
}) => {
  const { token } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [googleAuthReady, setGoogleAuthReady] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [mealTimes, setMealTimes] = useState({
    breakfast: { hour: 8, minute: 0 },
    lunch: { hour: 12, minute: 30 },
    dinner: { hour: 19, minute: 0 },
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleAuthError("Google Calendar client ID is not configured");
      return;
    }

    const loadGisLibrary = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGisClient;
      script.onerror = () => {
        setGoogleAuthError("Failed to load Google Identity Services");
      };
      document.body.appendChild(script);
    };

    const initializeGisClient = () => {
      if (!window.google || !window.google.accounts) {
        setGoogleAuthError("Google Identity Services failed to load properly");
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGoogleAuthReady(true);
              setGoogleAuthError(null);
            } else {
              setGoogleAuthError("Failed to get access token from Google");
            }
          },
          error_callback: (error: any) => {
            console.error("Error getting token:", error);
            setGoogleAuthError("Error during Google authentication");
          }
        });

        setTokenClient(client);
        setGoogleAuthReady(true);
        setGoogleAuthError(null);
      } catch (error) {
        console.error("Error initializing Google Auth:", error);
        setGoogleAuthError("Failed to initialize Google authentication");
      }
    };

    if (!window.google || !window.google.accounts) {
      loadGisLibrary();
    } else {
      initializeGisClient();
    }
  }, []);

  const handleConnectToGoogleCalendar = async () => {
    if (!googleAuthReady || !tokenClient || !token) {
      toast.error("Google authentication is not ready. Please try again.");
      return;
    }

    setIsConnecting(true);
    try {
      tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            const response = await connectMealPlanToGoogleCalendar(
              id,
              tokenResponse.access_token,
              { mealTimes },
              token
            );

            if (response.success) {
              toast.success("Your meal plan has been connected to Google Calendar!");
              plan.connectedToCalendar = true;
              plan.calendarConnectionDate = new Date().toISOString();
            } else {
              toast.error(response.message || "Failed to connect to Google Calendar");
            }
          } catch (error) {
            console.error("Error connecting to Google Calendar:", error);
            toast.error("An error occurred while connecting to Google Calendar");
          } finally {
            setIsConnecting(false);
            setShowTimeSettings(false);
          }
        } else {
          toast.error(
            <div>
              <p className="font-bold">Google Calendar access denied</p>
              <p className="text-sm mt-1">This account needs to be added as a test user.</p>
              <a 
                href="mailto:youremail@example.com?subject=Add me as a Google Calendar test user&body=Please add my email address to test the calendar feature: "
                className="text-blue-500 underline block mt-1 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Request access via email
              </a>
            </div>,
            { duration: 8000 }
          );
          setIsConnecting(false);
        }
      };

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error("Error requesting token:", error);
      toast.error("An error occurred during Google authentication");
      setIsConnecting(false);
    }
  };

  const handleDisconnectFromGoogleCalendar = async () => {
    if (!googleAuthReady || !tokenClient || !token) {
      toast.error("Google authentication is not ready. Please try again.");
      return;
    }

    if (!confirm("Are you sure you want to disconnect this meal plan from Google Calendar? All calendar events will be removed.")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            const response = await disconnectMealPlanFromGoogleCalendar(
              id,
              tokenResponse.access_token,
              token
            );

            if (response.success) {
              toast.success("Your meal plan has been disconnected from Google Calendar");
              plan.connectedToCalendar = false;
              plan.calendarConnectionDate = undefined;
            } else {
              toast.error(response.message || "Failed to disconnect from Google Calendar");
            }
          } catch (error) {
            console.error("Error disconnecting from Google Calendar:", error);
            toast.error("An error occurred while disconnecting from Google Calendar");
          } finally {
            setIsDisconnecting(false);
          }
        } else {
          const errorElement = (
            <div className="space-y-1">
              <p className="font-medium">Google Calendar access denied</p>
              <p className="text-sm">Your Google account needs to be added as a test user first.</p>
              <div className="flex space-x-2 mt-2">
                <a 
                  href="https://forms.gle/YourGoogleFormLinkHere" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 inline-flex items-center"
                >
                  <span>Request Access</span>
                </a>
                <button
                  onClick={() => toast.dismiss()}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
          
          toast.error(errorElement, { duration: 10000 });
          setIsConnecting(false);
        }
      };

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Error requesting token:", error);
      toast.error("An error occurred during Google authentication");
      setIsDisconnecting(false);
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const time = new Date();
    time.setHours(hour, minute);
    return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const updateMealTime = (meal: string, field: 'hour' | 'minute', value: number) => {
    setMealTimes(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal as keyof typeof prev],
        [field]: parseInt(value.toString(), 10)
      }
    }));
  };
  console.log('connected to calendar', plan)

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="bg-primary text-primary-foreground p-3 sm:p-5 relative">
          <DialogTitle className="text-lg sm:text-2xl font-bold mb-1">{plan.name}</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 text-xs sm:text-sm">
            {format(new Date(plan.date), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-3 sm:p-5 grid sm:h-fit h-[450px] sm:scroll-auto overflow-y-scroll sm:overflow-y-auto sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
          {/* Top grid: Statistics */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="p-2 sm:p-3 flex flex-col items-center justify-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                {countMeals(plan.plan)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Total meals</div>
            </Card>
            <Card className="p-2 sm:p-3 flex flex-col items-center justify-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">7</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Days planned</div>
            </Card>
          </div >
            {/* Google Calendar Section */}
            <Card className={`mt-2 sm:mt-3 p-2 sm:p-3 ${
            plan.connectedToCalendar 
              ? "bg-green-500/10 border-green-500/30" 
              : googleAuthError 
                ? "bg-destructive/10 border-destructive/30"
                : "bg-primary/10 border-primary/30"
          }`}>
            <div className="flex items-center mb-2">
              {googleAuthError ? (
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              ) : (
                <CalendarIcon className={`h-4 w-4 mr-2 ${
                  plan.connectedToCalendar ? "text-primary" : "text-primary"
                }`} />
              )}
              <h3 className={`text-sm font-medium ${
                googleAuthError
                  ? "text-destructive"
                  : plan.connectedToCalendar 
                    ? "text-primary" 
                    : "text-primary"
              }`}>
                {googleAuthError 
                  ? "Google Calendar Configuration Error" 
                  : plan.connectedToCalendar 
                    ? "Connected to Google Calendar" 
                    : "Not connected to Google Calendar"}
              </h3>
            </div>
            
            {googleAuthError && (
              <p className="text-xs text-destructive mb-2">
                {googleAuthError}
              </p>
            )}
            
            {!googleAuthError && plan.connectedToCalendar && plan.calendarConnectionDate && (
              <p className="text-xs text-muted-foreground mb-2">
                Connected on {format(new Date(plan.calendarConnectionDate), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            )}
            
            {!plan.connectedToCalendar && !googleAuthError && <TestUserInfo />}
            
            {!googleAuthError && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {plan.connectedToCalendar 
                    ? "You can sync your meal plan with Google Calendar." 
                    : "Connect your meal plan to Google Calendar for better organization."}
                </p>
          <SyncCalendarButton 
            mealPlanId={id}
            tokenClient={tokenClient}
            googleAuthReady={googleAuthReady}
          />
                {plan.connectedToCalendar ? (
                  <Button
                    onClick={handleDisconnectFromGoogleCalendar}
                    disabled={isDisconnecting || !googleAuthReady}
                    variant="destructive"
                    className="w-full py-2 px-3 mt-2 text-sm"
                  >
                    {isDisconnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-red-500 border-red-500/30 rounded-full animate-spin mr-2"></div>
                        Disconnecting...
                      </>
                    ) : !googleAuthReady ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-red-500 border-red-500/30 rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1.5" />
                        Disconnect from Calendar
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    {showTimeSettings ? (
                      <div className="mt-3 bg-card p-3 rounded-lg border border-border">
                        <h4 className="text-xs font-medium text-foreground mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-primary" />
                          Meal Times Settings
                        </h4>
                        
                        <div className="space-y-2 mb-3">
                          {['breakfast', 'lunch', 'dinner'].map((meal) => (
                            <div key={meal} className="flex items-center justify-between">
                              <label className="text-xs capitalize text-foreground">{meal}:</label>
                              <div className="flex items-center space-x-1">
                                <select 
                                  value={mealTimes[meal as keyof typeof mealTimes].hour}
                                  onChange={(e) => updateMealTime(meal, 'hour', parseInt(e.target.value))}
                                  className="text-xs p-1 text-primary border border-border rounded bg-background text-foreground"
                                >
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                  ))}
                                </select>
                                <span className="text-foreground">:</span>
                                <select 
                                  value={mealTimes[meal as keyof typeof mealTimes].minute}
                                  onChange={(e) => updateMealTime(meal, 'minute', parseInt(e.target.value))}
                                  className="text-xs p-1 text-primary border border-border rounded bg-background text-foreground"
                                >
                                  {[0, 15, 30, 45].map((min) => (
                                    <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                                  ))}
                                </select>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(
                                    mealTimes[meal as keyof typeof mealTimes].hour, 
                                    mealTimes[meal as keyof typeof mealTimes].minute
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleConnectToGoogleCalendar}
                            disabled={isConnecting || !googleAuthReady}
                            className="flex-1 text-xs"
                          >
                            {isConnecting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-t-primary-foreground border-primary-foreground/30 rounded-full animate-spin mr-1"></div>
                                Connecting...
                              </>
                            ) : (
                              <>
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Connect
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowTimeSettings(false)}
                            variant="outline"
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowTimeSettings(true)}
                        disabled={!googleAuthReady}
                        className="w-full mt-2 text-sm"
                      >
                        {!googleAuthReady ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></div>
                            Loading Google Calendar...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            Connect to Google Calendar
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

              </div>
            )}
          </Card>
        
          </div>
          <div>
        
            {/* Middle grid: Notes (if any) */}
            {plan.notes && (
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/30 flex">
              <div className="mr-2 mt-0.5">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-primary mb-1">Notes</h3>
                <p className="text-xs text-foreground">{plan.notes}</p>
              </div>
            </div>
          )}
          {/* Primary Action Grid */}
          <div className="grid mt-2 sm:mt-3 grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={() => {
                onLoad(plan);
                onClose();
              }}
              className="py-2 sm:py-2.5 px-2 sm:px-3 text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Load Plan
            </Button>
            
            <Button
              onClick={() => {
                onViewDetails();
                onClose();
              }}
              variant="outline"
              className="py-2 sm:py-2.5 px-2 sm:px-3 text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </Button>
          </div>
          
          {/* Secondary Action Grid */}
          <div className="grid mt-2 sm:mt-3 grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={onDuplicate}
              variant="outline"
              size="sm"
              className="text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Duplicate
            </Button>
            
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
          </div>
          
          {/* Cancel button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="mt-2 sm:mt-3 w-full text-sm sm:text-base"
          >
            Cancel
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};