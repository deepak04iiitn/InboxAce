// Email utility functions for template variable replacement and formatting

export interface JobData {
  recipientName: string;
  recipientEmail: string;
  recipientGender: string;
  position: string;
  company: string;
  customSubject?: string | null;
  customBody?: string | null;
  template?: {
    subject: string;
    body: string;
  } | null;
}

export interface UserData {
  name?: string | null;
  email?: string | null;
}

/**
 * Replaces template variables in text with actual job and user data
 * @param text - The text containing template variables
 * @param job - Job data containing recipient and position information
 * @param user - User data containing sender information
 * @returns Text with variables replaced
 */
export function replaceVariables(text: string, job: JobData, user: UserData): string {
  if (!text) return text;
  
  return text
    .replace(/{{recipientName}}/g, job.recipientName || "")
    .replace(/{{recipientGender}}/g, 
      job.recipientGender === "MALE" ? "Mr." : 
      job.recipientGender === "FEMALE" ? "Ms." : "")
    .replace(/{{position}}/g, job.position || "")
    .replace(/{{company}}/g, job.company || "")
    .replace(/{{yourName}}/g, user.name || "")
    .replace(/{{yourEmail}}/g, user.email || "");
}

/**
 * Gets the final email content with variables replaced
 * @param job - Job data
 * @param user - User data
 * @returns Object with processed subject and body
 */
export function getProcessedEmailContent(job: JobData, user: UserData): { subject: string; body: string } {
  const subject = job.customSubject || job.template?.subject || "Job Application";
  const body = job.customBody || job.template?.body || "";
  
  return {
    subject: replaceVariables(subject || "", job, user),
    body: replaceVariables(body || "", job, user)
  };
}

/**
 * Preserves HTML formatting in email content
 * @param content - HTML content to preserve
 * @returns Properly formatted HTML content
 */
export function preserveHtmlFormatting(content: string): string {
  if (!content) return content;
  
  // Ensure proper HTML structure
  // Convert line breaks to <br> tags if they're not already HTML
  let formattedContent = content;
  
  // If content doesn't contain HTML tags but has line breaks, convert them
  if (!formattedContent.includes('<') && !formattedContent.includes('>')) {
    formattedContent = formattedContent.replace(/\n/g, '<br>');
  }
  
  // Ensure the content is wrapped in proper HTML structure
  if (!formattedContent.includes('<html>')) {
    formattedContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${formattedContent}
        </body>
      </html>
    `;
  }
  
  return formattedContent;
}
