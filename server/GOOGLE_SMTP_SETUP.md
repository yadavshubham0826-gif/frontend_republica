# Detailed Guide to Setting Up Google SMTP with OAuth 2.0

This guide will walk you through the process of setting up Google SMTP with OAuth 2.0 to send emails from your application.

## Step 1: Create a Project in the Google API Console

1.  Go to the [Google API Console](https://console.developers.google.com/).
2.  Click on the project dropdown and select **New Project**.
3.  Give your project a name (e.g., "My App Email Service") and click **Create**.

## Step 2: Enable the Gmail API

1.  In the API Console, go to the **Dashboard**.
2.  Click on **+ ENABLE APIS AND SERVICES**.
3.  Search for "Gmail API" and select it.
4.  Click the **Enable** button.

## Step 3: Create OAuth 2.0 Credentials

1.  In the left sidebar, go to **Credentials**.
2.  Click on **Create Credentials** and select **OAuth client ID**.
3.  If you haven't configured a consent screen, you will be prompted to do so.
    *   Choose **External** and click **Create**.
    *   Fill in the required fields (App name, User support email, Developer contact information).
    *   Click **Save and Continue** on the Scopes, and Test users pages.
    *   Click **Back to Dashboard**.
4.  Go back to **Credentials**, click **Create Credentials** and select **OAuth client ID**.
5.  For the **Application type**, select **Web application**.
6.  Give it a name (e.g., "Web Client 1").
7.  Under **Authorized redirect URIs**, click **ADD URI** and enter `https://developers.google.com/oauthplayground`.
8.  Click **Create**.
9.  You will now see your **Client ID** and **Client Secret**. Copy these values. You will need them for your `.env` file.

    *   `GOOGLE_CLIENT_ID`=your_client_id
    *   `GOOGLE_CLIENT_SECRET`=your_client_secret

## Step 4: Get a Refresh Token from the OAuth 2.0 Playground

1.  Go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2.  In the top right corner, click the gear icon (OAuth 2.0 configuration).
3.  Check the box for **Use your own OAuth credentials**.
4.  Paste your **Client ID** and **Client Secret** into the fields.
5.  In the list of scopes on the left, find and select **Gmail API v1** and select the `https://mail.google.com/` scope.
6.  Click the **Authorize APIs** button.
7.  You will be prompted to sign in with your Google account. Choose the account you want to send emails from.
8.  You will see a screen saying "This app isn't verified". Click on **Advanced** and then **Go to (your app name) (unsafe)**.
9.  Grant the permissions to your app.
10. You will be redirected back to the OAuth 2.0 Playground. Click on the **Exchange authorization code for tokens** button.
11. You will now see your **Refresh token**. Copy this value. You will need it for your `.env` file.

    *   `GOOGLE_REFRESH_TOKEN`=your_refresh_token

## Step 5: Configure your Environment Variables

Make sure your `.env` file in the `server` directory has the following variables set correctly:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
EMAIL_USERNAME=your_email@gmail.com
```

**Important:** The `EMAIL_USERNAME` must be the same email address as the one you used to authorize the app in the OAuth 2.0 Playground.

After setting these variables, restart your server. The "Failed to create access token" error should be resolved.
