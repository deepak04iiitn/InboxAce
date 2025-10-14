// Comprehensive template variable system for dynamic email templates

export interface VariableCategory {
  name: string;
  description: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  displayName: string;
  description: string;
  example: string;
  category: string;
  isRequired?: boolean;
  dataType: 'string' | 'date' | 'number' | 'boolean' | 'url' | 'email';
}

export const VARIABLE_CATEGORIES: VariableCategory[] = [
  {
    name: "Recipient Information",
    description: "Information about the person receiving the email",
    variables: [
      {
        key: "{{recipientName}}",
        displayName: "Recipient Name",
        description: "Full name of the recipient",
        example: "John Smith",
        category: "recipient",
        isRequired: true,
        dataType: "string"
      },
      {
        key: "{{recipientFirstName}}",
        displayName: "Recipient First Name",
        description: "First name of the recipient",
        example: "John",
        category: "recipient",
        dataType: "string"
      },
      {
        key: "{{recipientLastName}}",
        displayName: "Recipient Last Name",
        description: "Last name of the recipient",
        example: "Smith",
        category: "recipient",
        dataType: "string"
      },
      {
        key: "{{recipientGender}}",
        displayName: "Recipient Gender",
        description: "Gender-based salutation (Mr./Ms.)",
        example: "Mr.",
        category: "recipient",
        dataType: "string"
      },
      {
        key: "{{recipientEmail}}",
        displayName: "Recipient Email",
        description: "Email address of the recipient",
        example: "john.smith@company.com",
        category: "recipient",
        dataType: "email"
      },
      {
        key: "{{recipientTitle}}",
        displayName: "Recipient Job Title",
        description: "Current job title of the recipient",
        example: "Senior Software Engineer",
        category: "recipient",
        dataType: "string"
      },
      {
        key: "{{recipientDepartment}}",
        displayName: "Recipient Department",
        description: "Department the recipient works in",
        example: "Engineering",
        category: "recipient",
        dataType: "string"
      },
      {
        key: "{{recipientLocation}}",
        displayName: "Recipient Location",
        description: "City/State/Country of the recipient",
        example: "San Francisco, CA",
        category: "recipient",
        dataType: "string"
      }
    ]
  },
  {
    name: "Company Information",
    description: "Information about the recipient's company",
    variables: [
      {
        key: "{{company}}",
        displayName: "Company Name",
        description: "Name of the recipient's company",
        example: "Tech Corp",
        category: "company",
        isRequired: true,
        dataType: "string"
      },
      {
        key: "{{companySize}}",
        displayName: "Company Size",
        description: "Number of employees at the company",
        example: "500-1000 employees",
        category: "company",
        dataType: "string"
      },
      {
        key: "{{companyIndustry}}",
        displayName: "Company Industry",
        description: "Industry sector of the company",
        example: "Technology",
        category: "company",
        dataType: "string"
      },
      {
        key: "{{companyWebsite}}",
        displayName: "Company Website",
        description: "Company's website URL",
        example: "https://techcorp.com",
        category: "company",
        dataType: "url"
      },
      {
        key: "{{companyLocation}}",
        displayName: "Company Location",
        description: "Company headquarters location",
        example: "San Francisco, CA",
        category: "company",
        dataType: "string"
      },
      {
        key: "{{companyFounded}}",
        displayName: "Company Founded Year",
        description: "Year the company was founded",
        example: "2015",
        category: "company",
        dataType: "number"
      }
    ]
  },
  {
    name: "Position Information",
    description: "Details about the job position being applied for",
    variables: [
      {
        key: "{{position}}",
        displayName: "Job Position",
        description: "Title of the position being applied for",
        example: "Senior Software Engineer",
        category: "position",
        isRequired: true,
        dataType: "string"
      },
      {
        key: "{{positionLevel}}",
        displayName: "Position Level",
        description: "Seniority level of the position",
        example: "Senior",
        category: "position",
        dataType: "string"
      },
      {
        key: "{{positionDepartment}}",
        displayName: "Position Department",
        description: "Department the position is in",
        example: "Engineering",
        category: "position",
        dataType: "string"
      },
      {
        key: "{{positionLocation}}",
        displayName: "Position Location",
        description: "Location of the position",
        example: "Remote",
        category: "position",
        dataType: "string"
      },
      {
        key: "{{positionType}}",
        displayName: "Position Type",
        description: "Type of employment (Full-time, Part-time, Contract)",
        example: "Full-time",
        category: "position",
        dataType: "string"
      },
      {
        key: "{{positionSalary}}",
        displayName: "Position Salary",
        description: "Salary range for the position",
        example: "$120,000 - $150,000",
        category: "position",
        dataType: "string"
      },
      {
        key: "{{positionRequirements}}",
        displayName: "Position Requirements",
        description: "Key requirements for the position",
        example: "5+ years React experience",
        category: "position",
        dataType: "string"
      }
    ]
  },
  {
    name: "Your Information",
    description: "Information about the sender",
    variables: [
      {
        key: "{{yourName}}",
        displayName: "Your Name",
        description: "Your full name",
        example: "Jane Doe",
        category: "sender",
        isRequired: true,
        dataType: "string"
      },
      {
        key: "{{yourFirstName}}",
        displayName: "Your First Name",
        description: "Your first name",
        example: "Jane",
        category: "sender",
        dataType: "string"
      },
      {
        key: "{{yourLastName}}",
        displayName: "Your Last Name",
        description: "Your last name",
        example: "Doe",
        category: "sender",
        dataType: "string"
      },
      {
        key: "{{yourEmail}}",
        displayName: "Your Email",
        description: "Your email address",
        example: "jane.doe@email.com",
        category: "sender",
        dataType: "email"
      },
      {
        key: "{{yourTitle}}",
        displayName: "Your Job Title",
        description: "Your current job title",
        example: "Software Engineer",
        category: "sender",
        dataType: "string"
      },
      {
        key: "{{yourCompany}}",
        displayName: "Your Company",
        description: "Your current company",
        example: "Current Corp",
        category: "sender",
        dataType: "string"
      },
      {
        key: "{{yourLocation}}",
        displayName: "Your Location",
        description: "Your current location",
        example: "New York, NY",
        category: "sender",
        dataType: "string"
      },
      {
        key: "{{yourLinkedIn}}",
        displayName: "Your LinkedIn",
        description: "Your LinkedIn profile URL",
        example: "https://linkedin.com/in/janedoe",
        category: "sender",
        dataType: "url"
      },
      {
        key: "{{yourPortfolio}}",
        displayName: "Your Portfolio",
        description: "Your portfolio website URL",
        example: "https://janedoe.dev",
        category: "sender",
        dataType: "url"
      },
      {
        key: "{{yourGitHub}}",
        displayName: "Your GitHub",
        description: "Your GitHub profile URL",
        example: "https://github.com/janedoe",
        category: "sender",
        dataType: "url"
      }
    ]
  },
  {
    name: "Experience & Skills",
    description: "Professional experience and skills",
    variables: [
      {
        key: "{{yearsExperience}}",
        displayName: "Years of Experience",
        description: "Your years of professional experience",
        example: "5",
        category: "experience",
        dataType: "number"
      },
      {
        key: "{{relevantExperience}}",
        displayName: "Relevant Experience",
        description: "Years of relevant experience for this role",
        example: "3",
        category: "experience",
        dataType: "number"
      },
      {
        key: "{{keySkills}}",
        displayName: "Key Skills",
        description: "Your main technical skills",
        example: "React, Node.js, TypeScript",
        category: "experience",
        dataType: "string"
      },
      {
        key: "{{recentProjects}}",
        displayName: "Recent Projects",
        description: "Description of recent relevant projects",
        example: "Built a scalable e-commerce platform",
        category: "experience",
        dataType: "string"
      },
      {
        key: "{{achievements}}",
        displayName: "Key Achievements",
        description: "Notable professional achievements",
        example: "Led team of 5 developers",
        category: "experience",
        dataType: "string"
      },
      {
        key: "{{education}}",
        displayName: "Education",
        description: "Your educational background",
        example: "BS Computer Science, MIT",
        category: "experience",
        dataType: "string"
      },
      {
        key: "{{certifications}}",
        displayName: "Certifications",
        description: "Relevant professional certifications",
        example: "AWS Certified Developer",
        category: "experience",
        dataType: "string"
      }
    ]
  },
  {
    name: "Motivation & Interest",
    description: "Why you're interested in the role/company",
    variables: [
      {
        key: "{{whyInterested}}",
        displayName: "Why Interested",
        description: "Why you're interested in this role",
        example: "Passionate about building scalable systems",
        category: "motivation",
        dataType: "string"
      },
      {
        key: "{{companyValues}}",
        displayName: "Company Values Alignment",
        description: "How you align with company values",
        example: "Share the mission of democratizing technology",
        category: "motivation",
        dataType: "string"
      },
      {
        key: "{{careerGoals}}",
        displayName: "Career Goals",
        description: "Your career aspirations",
        example: "Looking to grow into a tech lead role",
        category: "motivation",
        dataType: "string"
      },
      {
        key: "{{whatYouBring}}",
        displayName: "What You Bring",
        description: "Unique value you bring to the team",
        example: "Strong problem-solving and team collaboration skills",
        category: "motivation",
        dataType: "string"
      }
    ]
  },
  {
    name: "Timing & Availability",
    description: "When you're available and timeline",
    variables: [
      {
        key: "{{availableDate}}",
        displayName: "Available Date",
        description: "When you're available to start",
        example: "January 15, 2024",
        category: "timing",
        dataType: "date"
      },
      {
        key: "{{noticePeriod}}",
        displayName: "Notice Period",
        description: "Your current notice period",
        example: "2 weeks",
        category: "timing",
        dataType: "string"
      },
      {
        key: "{{preferredStartDate}}",
        displayName: "Preferred Start Date",
        description: "Your preferred start date",
        example: "February 1, 2024",
        category: "timing",
        dataType: "date"
      },
      {
        key: "{{timezone}}",
        displayName: "Timezone",
        description: "Your current timezone",
        example: "PST",
        category: "timing",
        dataType: "string"
      }
    ]
  },
  {
    name: "Contact & Next Steps",
    description: "How to reach you and next steps",
    variables: [
      {
        key: "{{phoneNumber}}",
        displayName: "Phone Number",
        description: "Your contact phone number",
        example: "(555) 123-4567",
        category: "contact",
        dataType: "string"
      },
      {
        key: "{{bestTimeToCall}}",
        displayName: "Best Time to Call",
        description: "When is the best time to reach you",
        example: "Weekdays 9 AM - 5 PM PST",
        category: "contact",
        dataType: "string"
      },
      {
        key: "{{preferredContact}}",
        displayName: "Preferred Contact Method",
        description: "How you prefer to be contacted",
        example: "Email or LinkedIn",
        category: "contact",
        dataType: "string"
      },
      {
        key: "{{nextSteps}}",
        displayName: "Next Steps",
        description: "What you'd like to happen next",
        example: "Would love to discuss this opportunity further",
        category: "contact",
        dataType: "string"
      }
    ]
  },
  {
    name: "Dynamic Content",
    description: "Content that changes based on context",
    variables: [
      {
        key: "{{currentDate}}",
        displayName: "Current Date",
        description: "Today's date",
        example: "January 15, 2024",
        category: "dynamic",
        dataType: "date"
      },
      {
        key: "{{currentTime}}",
        displayName: "Current Time",
        description: "Current time",
        example: "2:30 PM",
        category: "dynamic",
        dataType: "string"
      },
      {
        key: "{{dayOfWeek}}",
        displayName: "Day of Week",
        description: "Current day of the week",
        example: "Monday",
        category: "dynamic",
        dataType: "string"
      },
      {
        key: "{{randomFact}}",
        displayName: "Random Fact",
        description: "A random interesting fact",
        example: "Did you know that honey never spoils?",
        category: "dynamic",
        dataType: "string"
      },
      {
        key: "{{motivationalQuote}}",
        displayName: "Motivational Quote",
        description: "A motivational quote",
        example: "Success is not final, failure is not fatal",
        category: "dynamic",
        dataType: "string"
      }
    ]
  }
];

// Get all variables as a flat array
export const ALL_VARIABLES: TemplateVariable[] = VARIABLE_CATEGORIES.flatMap(category => category.variables);

// Get variables by category
export const getVariablesByCategory = (categoryName: string): TemplateVariable[] => {
  const category = VARIABLE_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.variables : [];
};

// Get required variables
export const getRequiredVariables = (): TemplateVariable[] => {
  return ALL_VARIABLES.filter(variable => variable.isRequired);
};

// Get variables by data type
export const getVariablesByType = (dataType: string): TemplateVariable[] => {
  return ALL_VARIABLES.filter(variable => variable.dataType === dataType);
};

// Search variables by keyword
export const searchVariables = (keyword: string): TemplateVariable[] => {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_VARIABLES.filter(variable => 
    variable.displayName.toLowerCase().includes(lowerKeyword) ||
    variable.description.toLowerCase().includes(lowerKeyword) ||
    variable.key.toLowerCase().includes(lowerKeyword)
  );
};

// Template type configurations
export const TEMPLATE_TYPES = [
  {
    value: "APPLICATION",
    label: "Job Application",
    description: "Initial job application email",
    icon: "📝",
    defaultVariables: ["{{recipientName}}", "{{position}}", "{{company}}", "{{yourName}}", "{{yourTitle}}"]
  },
  {
    value: "REFERRAL_REQUEST",
    label: "Referral Request",
    description: "Request for job referral",
    icon: "🤝",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{position}}", "{{yourName}}", "{{whyInterested}}"]
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-up",
    description: "Follow-up after initial contact",
    icon: "🔄",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{position}}", "{{yourName}}", "{{nextSteps}}"]
  },
  {
    value: "THANK_YOU",
    label: "Thank You",
    description: "Thank you after interview or meeting",
    icon: "🙏",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{nextSteps}}"]
  },
  {
    value: "REJECTION_FOLLOW_UP",
    label: "Rejection Follow-up",
    description: "Follow-up after rejection",
    icon: "💪",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{nextSteps}}"]
  },
  {
    value: "INTERVIEW_FOLLOW_UP",
    label: "Interview Follow-up",
    description: "Follow-up after interview",
    icon: "🎯",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{position}}", "{{yourName}}"]
  },
  {
    value: "NETWORKING",
    label: "Networking",
    description: "Professional networking outreach",
    icon: "🌐",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{yourTitle}}"]
  },
  {
    value: "COLD_OUTREACH",
    label: "Cold Outreach",
    description: "Cold email to potential contacts",
    icon: "❄️",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{whyInterested}}"]
  },
  {
    value: "PARTNERSHIP",
    label: "Partnership",
    description: "Partnership or collaboration proposal",
    icon: "🤝",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{yourCompany}}"]
  },
  {
    value: "COLLABORATION",
    label: "Collaboration",
    description: "Project collaboration request",
    icon: "👥",
    defaultVariables: ["{{recipientName}}", "{{company}}", "{{yourName}}", "{{recentProjects}}"]
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Custom template type",
    icon: "⚙️",
    defaultVariables: ["{{recipientName}}", "{{yourName}}"]
  }
];

// Category configurations with icons and descriptions
export const TEMPLATE_CATEGORIES = [
  { value: "GENERAL", label: "General", icon: "📧", description: "General purpose templates" },
  { value: "TECH", label: "Technology", icon: "💻", description: "Software, IT, and tech industry" },
  { value: "FINANCE", label: "Finance", icon: "💰", description: "Banking, investment, and financial services" },
  { value: "MARKETING", label: "Marketing", icon: "📈", description: "Marketing and advertising roles" },
  { value: "SALES", label: "Sales", icon: "💼", description: "Sales and business development" },
  { value: "DESIGN", label: "Design", icon: "🎨", description: "UI/UX, graphic, and product design" },
  { value: "CONSULTING", label: "Consulting", icon: "🔍", description: "Management and business consulting" },
  { value: "HEALTHCARE", label: "Healthcare", icon: "🏥", description: "Medical and healthcare industry" },
  { value: "EDUCATION", label: "Education", icon: "🎓", description: "Teaching and educational roles" },
  { value: "LEGAL", label: "Legal", icon: "⚖️", description: "Law and legal services" },
  { value: "REAL_ESTATE", label: "Real Estate", icon: "🏠", description: "Real estate and property" },
  { value: "NON_PROFIT", label: "Non-Profit", icon: "❤️", description: "Non-profit and charitable organizations" },
  { value: "ENTERTAINMENT", label: "Entertainment", icon: "🎬", description: "Media, entertainment, and creative" },
  { value: "RETAIL", label: "Retail", icon: "🛍️", description: "Retail and consumer goods" },
  { value: "MANUFACTURING", label: "Manufacturing", icon: "🏭", description: "Manufacturing and production" },
  { value: "AGRICULTURE", label: "Agriculture", icon: "🌾", description: "Farming and agricultural sector" },
  { value: "TRANSPORTATION", label: "Transportation", icon: "🚚", description: "Logistics and transportation" },
  { value: "ENERGY", label: "Energy", icon: "⚡", description: "Energy and utilities" },
  { value: "TELECOMMUNICATIONS", label: "Telecommunications", icon: "📡", description: "Telecom and communications" },
  { value: "GOVERNMENT", label: "Government", icon: "🏛️", description: "Government and public sector" },
  { value: "OTHER", label: "Other", icon: "📋", description: "Other industries and sectors" }
];
