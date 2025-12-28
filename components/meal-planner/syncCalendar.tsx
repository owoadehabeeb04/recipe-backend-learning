import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface SyncCalendarButtonProps {
  mealPlanId: string;
  tokenClient: any;
  googleAuthReady: boolean;
  onSyncComplete?: (success: boolean) => void;
}

const SyncCalendarButton: React.FC<SyncCalendarButtonProps> = ({
  mealPlanId,
  tokenClient,
  googleAuthReady,
  onSyncComplete
}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { token } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [localTokenClient, setLocalTokenClient] = useState<any>(null);

  // Create our own token client instance to avoid COOP issues
  useEffect(() => {
    if (
      window.google &&
      window.google.accounts &&
      window.google.accounts.oauth2
    ) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          scope: "https://www.googleapis.com/auth/calendar",
          callback: (tokenResponse: any) => {
            // Will be overridden in handleSync
          },
          error_callback: (error: any) => {
            console.error("Token client error:", error);
            toast.error("Google authentication error");
            setIsSyncing(false);
          }
        });

        setLocalTokenClient(client);
      } catch (error) {
        console.error("Error creating token client:", error);
      }
    }
  }, []);

  const handleSync = async () => {
    // Use our local token client if available, otherwise fall back to the parent's
    const activeTokenClient = localTokenClient || tokenClient;

    if (!googleAuthReady || !activeTokenClient || !token) {
      toast.error("Google authentication is not ready. Please try again.");
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Explicitly set the callback right before requesting
      activeTokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          syncCalendar(tokenResponse.access_token);
        } else {
          console.error("No access token in response:", tokenResponse);

          // Provide helpful error message with retry option
          toast.error(
            <div>
              <p className="font-bold">Google calendar access denied</p>
              <p className="text-sm mt-1">
                Please make sure your Google account is authorized.
              </p>
              <button
                onClick={retryWithConsent}
                className="mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Try Again
              </button>
            </div>,
            { duration: 8000 }
          );

          setIsSyncing(false);
          if (onSyncComplete) onSyncComplete(false);
        }
      };

      // Request token without showing consent if possible
      activeTokenClient.requestAccessToken({
        prompt: "" // Empty string tries to use existing grants first
      });
    } catch (error: any) {
      console.error("Error requesting token:", error);
      toast.error(`Authentication error: ${error.message || "Unknown error"}`);
      setIsSyncing(false);
      if (onSyncComplete) onSyncComplete(false);
    }
  };

  // Retry with explicit consent
  const retryWithConsent = () => {
    const activeTokenClient = localTokenClient || tokenClient;

    if (!activeTokenClient) {
      toast.error("Google authentication is not available");
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      activeTokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          syncCalendar(tokenResponse.access_token);
        } else {
          console.error("No access token even with consent:", tokenResponse);
          toast.error(
            "Authorization failed. Please check that your account is approved for testing."
          );
          setIsSyncing(false);
          if (onSyncComplete) onSyncComplete(false);
        }
      };

      // Request with explicit consent
      activeTokenClient.requestAccessToken({
        prompt: "consent"
      });
    } catch (error: any) {
      console.error("Error on consent retry:", error);
      toast.error(
        `Authentication retry failed: ${error.message || "Unknown error"}`
      );
      setIsSyncing(false);
      if (onSyncComplete) onSyncComplete(false);
    }
  };

  // Separate the calendar sync logic
  const syncCalendar = async (accessToken: string) => {
    try {
      const data = await axios.post(
        `${API_URL}/meal-planner/${mealPlanId}/calendar/sync`,
        {
            accessToken: accessToken
          },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!data) {
        toast.error("No response from server");
        setIsSyncing(false);
        if (onSyncComplete) onSyncComplete(false);
        return;
      }
const response = data?.data
      if (response.success) {
        toast.success("Calendar synchronized successfully!");
        setSyncResult({
          success: true,
          message: response.message || "Calendar synchronized successfully",
          details: response.data?.calendarUpdate || {}
        });
        if (onSyncComplete) onSyncComplete(true);
      } else {
        toast.error(response.message || "Failed to sync with Google Calendar");
        setSyncResult({
          success: false,
          message: response.message || "Failed to sync with Google Calendar"
        });
        if (onSyncComplete) onSyncComplete(false);
      }
    } catch (error: any) {
      console.error("Error syncing calendar:", error);
      toast.error("An error occurred while syncing with Google Calendar");
      setSyncResult({
        success: false,
        message: "An error occurred while syncing"
      });
      if (onSyncComplete) onSyncComplete(false);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="mt-3">
      <Button
        onClick={handleSync}
        disabled={isSyncing || !googleAuthReady}
        className="w-full py-2 px-3 text-sm"
      >
        {isSyncing ? (
          <>
            <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></div>
            Syncing Calendar...
          </>
        ) : !googleAuthReady ? (
          <>
            <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></div>
            Loading...
          </>
        ) : (
          <>
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Sync to Google Calendar
          </>
        )}
      </Button>

      {syncResult && syncResult.success === false && (
        <div className="mt-2 p-2 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/30">
          <p className="font-medium">{syncResult.message}</p>
          <Button
            onClick={retryWithConsent}
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
          >
            Retry with Consent
          </Button>
        </div>
      )}

      {syncResult && syncResult.success === true && (
        <div className="mt-2 p-2 text-xs rounded-lg bg-primary/10 text-primary border border-primary/30">
          <p className="font-medium">{syncResult.message}</p>
          {syncResult.details && (
            <div className="mt-1 space-y-0.5">
              {syncResult.details.createdEvents && (
                <p>{syncResult.details.createdEvents.length} events created</p>
              )}
              {syncResult.details.updatedEvents && (
                <p>{syncResult.details.updatedEvents.length} events updated</p>
              )}
              {syncResult.details.failedEvents &&
                syncResult.details.failedEvents.length > 0 && (
                  <p className="text-destructive font-medium">
                    {syncResult.details.failedEvents.length} events failed
                  </p>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncCalendarButton;
