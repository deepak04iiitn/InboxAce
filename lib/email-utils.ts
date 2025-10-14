// Email utility functions for template variable replacement and formatting
import { ALL_VARIABLES } from './template-variables';

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
  // Extended job data for comprehensive variables
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientTitle?: string;
  recipientDepartment?: string;
  recipientLocation?: string;
  companySize?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  companyLocation?: string;
  companyFounded?: string;
  positionLevel?: string;
  positionDepartment?: string;
  positionLocation?: string;
  positionType?: string;
  positionSalary?: string;
  positionRequirements?: string;
  yearsExperience?: number;
  relevantExperience?: number;
  keySkills?: string;
  recentProjects?: string;
  achievements?: string;
  education?: string;
  certifications?: string;
  whyInterested?: string;
  companyValues?: string;
  careerGoals?: string;
  whatYouBring?: string;
  availableDate?: string;
  noticePeriod?: string;
  preferredStartDate?: string;
  timezone?: string;
  phoneNumber?: string;
  bestTimeToCall?: string;
  preferredContact?: string;
  nextSteps?: string;
  yourFirstName?: string;
  yourLastName?: string;
  yourTitle?: string;
  yourCompany?: string;
  yourLocation?: string;
  yourLinkedIn?: string;
  yourPortfolio?: string;
  yourGitHub?: string;
}

export interface UserData {
  name?: string | null;
  email?: string | null;
  // Extended user data
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  linkedIn?: string | null;
  portfolio?: string | null;
  github?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
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
  
  // Get current date/time for dynamic variables
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Split name into first and last name
  const recipientNameParts = job.recipientName?.split(' ') || [];
  const recipientFirstName = recipientNameParts[0] || '';
  const recipientLastName = recipientNameParts.slice(1).join(' ') || '';
  
  const userNameParts = user.name?.split(' ') || [];
  const userFirstName = userNameParts[0] || '';
  const userLastName = userNameParts.slice(1).join(' ') || '';
  
  // Gender-based salutation
  const recipientGenderSalutation = 
    job.recipientGender === "MALE" ? "Mr." : 
    job.recipientGender === "FEMALE" ? "Ms." : "";
  
  // Replace all variables
  return text
    // Recipient Information
    .replace(/{{recipientName}}/g, job.recipientName || "")
    .replace(/{{recipientFirstName}}/g, recipientFirstName)
    .replace(/{{recipientLastName}}/g, recipientLastName)
    .replace(/{{recipientGender}}/g, recipientGenderSalutation)
    .replace(/{{recipientEmail}}/g, job.recipientEmail || "")
    .replace(/{{recipientTitle}}/g, job.recipientTitle || "")
    .replace(/{{recipientDepartment}}/g, job.recipientDepartment || "")
    .replace(/{{recipientLocation}}/g, job.recipientLocation || "")
    
    // Company Information
    .replace(/{{company}}/g, job.company || "")
    .replace(/{{companySize}}/g, job.companySize || "")
    .replace(/{{companyIndustry}}/g, job.companyIndustry || "")
    .replace(/{{companyWebsite}}/g, job.companyWebsite || "")
    .replace(/{{companyLocation}}/g, job.companyLocation || "")
    .replace(/{{companyFounded}}/g, job.companyFounded || "")
    
    // Position Information
    .replace(/{{position}}/g, job.position || "")
    .replace(/{{positionLevel}}/g, job.positionLevel || "")
    .replace(/{{positionDepartment}}/g, job.positionDepartment || "")
    .replace(/{{positionLocation}}/g, job.positionLocation || "")
    .replace(/{{positionType}}/g, job.positionType || "")
    .replace(/{{positionSalary}}/g, job.positionSalary || "")
    .replace(/{{positionRequirements}}/g, job.positionRequirements || "")
    
    // Your Information
    .replace(/{{yourName}}/g, user.name || "")
    .replace(/{{yourFirstName}}/g, userFirstName)
    .replace(/{{yourLastName}}/g, userLastName)
    .replace(/{{yourEmail}}/g, user.email || "")
    .replace(/{{yourTitle}}/g, user.title || job.yourTitle || "")
    .replace(/{{yourCompany}}/g, user.company || job.yourCompany || "")
    .replace(/{{yourLocation}}/g, user.location || job.yourLocation || "")
    .replace(/{{yourLinkedIn}}/g, user.linkedIn || job.yourLinkedIn || "")
    .replace(/{{yourPortfolio}}/g, user.portfolio || job.yourPortfolio || "")
    .replace(/{{yourGitHub}}/g, user.github || job.yourGitHub || "")
    
    // Experience & Skills
    .replace(/{{yearsExperience}}/g, job.yearsExperience?.toString() || "")
    .replace(/{{relevantExperience}}/g, job.relevantExperience?.toString() || "")
    .replace(/{{keySkills}}/g, job.keySkills || "")
    .replace(/{{recentProjects}}/g, job.recentProjects || "")
    .replace(/{{achievements}}/g, job.achievements || "")
    .replace(/{{education}}/g, job.education || "")
    .replace(/{{certifications}}/g, job.certifications || "")
    
    // Motivation & Interest
    .replace(/{{whyInterested}}/g, job.whyInterested || "")
    .replace(/{{companyValues}}/g, job.companyValues || "")
    .replace(/{{careerGoals}}/g, job.careerGoals || "")
    .replace(/{{whatYouBring}}/g, job.whatYouBring || "")
    
    // Timing & Availability
    .replace(/{{availableDate}}/g, job.availableDate || "")
    .replace(/{{noticePeriod}}/g, job.noticePeriod || "")
    .replace(/{{preferredStartDate}}/g, job.preferredStartDate || "")
    .replace(/{{timezone}}/g, user.timezone || job.timezone || "")
    
    // Contact & Next Steps
    .replace(/{{phoneNumber}}/g, user.phoneNumber || job.phoneNumber || "")
    .replace(/{{bestTimeToCall}}/g, job.bestTimeToCall || "")
    .replace(/{{preferredContact}}/g, job.preferredContact || "")
    .replace(/{{nextSteps}}/g, job.nextSteps || "")
    
    // Dynamic Content
    .replace(/{{currentDate}}/g, currentDate)
    .replace(/{{currentTime}}/g, currentTime)
    .replace(/{{dayOfWeek}}/g, dayOfWeek)
    .replace(/{{randomFact}}/g, getRandomFact())
    .replace(/{{motivationalQuote}}/g, getMotivationalQuote());
}

/**
 * Get a random interesting fact
 */
function getRandomFact(): string {
  const facts = [
    "Did you know that honey never spoils?",
    "The human brain contains approximately 86 billion neurons.",
    "A group of flamingos is called a 'flamboyance'.",
    "The shortest war in history lasted only 38-45 minutes.",
    "Octopuses have three hearts and blue blood.",
    "The Great Wall of China is not visible from space with the naked eye.",
    "A jiffy is an actual unit of time (1/100th of a second).",
    "Bananas are berries, but strawberries aren't.",
    "The human body produces 25 million new cells every second.",
    "There are more possible games of chess than atoms in the observable universe."
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Get a motivational quote
 */
function getMotivationalQuote(): string {
  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
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
