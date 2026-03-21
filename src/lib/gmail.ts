import { google } from "googleapis";

// OAuth2 Client Configuration
// This module uses the credentials discovered in the workspace .env
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

export const gmail = google.gmail({ version: "v1", auth: oauth2Client });

/**
 * Searches the user's inbox for specific queries
 */
export async function searchMessages(query: string, maxResults = 10) {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults
    });
    return res.data.messages || [];
  } catch (error) {
    console.error("Gmail Search Error:", error);
    return [];
  }
}

/**
 * Fetches the full content of a message
 */
export async function getMessage(id: string) {
  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full"
    });
    return res.data;
  } catch (error) {
    console.error("Gmail Fetch Error:", error);
    return null;
  }
}

/**
 * Parses the body from a Gmail message part
 */
export function parseBody(payload: any): string {
  if (!payload) return "";
  let body = "";
  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  } else if (payload.parts) {
    payload.parts.forEach((part: any) => {
      body += parseBody(part);
    });
  }
  return body;
}
