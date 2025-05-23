import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Auth Callback</title>
      <script>
        // Extract access token from URL hash fragment
        function getAccessToken() {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          return params.get('access_token');
        }

        // Send token back to parent window and close this one
        window.onload = function() {
          try {
            const token = getAccessToken();
            if (token) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                accessToken: token
              }, window.location.origin);
            } else {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Failed to get access token'
              }, window.location.origin);
            }
          } catch (e) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: e.message
            }, window.location.origin);
          } finally {
            // Close this window
            setTimeout(() => window.close(), 500);
          }
        };
      </script>
    </head>
    <body>
      <p>Authentication successful! You can close this window.</p>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}