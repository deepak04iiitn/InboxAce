# Enhanced Email Template System

## Overview

The Enhanced Email Template System provides a dynamic, adaptable template creation platform with 50+ variables across multiple categories, designed to serve users across various fields and industries.

## Key Features

### 🎯 Dynamic Template Categories
- **20+ Industry Categories**: From Technology and Finance to Healthcare and Government
- **Custom Categories**: Users can create their own category types
- **Industry-Specific Templates**: Tailored templates for different professional fields

### 📝 Template Types
- **Application Templates**: Job application emails
- **Referral Request**: Professional referral requests
- **Follow-up Templates**: Post-application follow-ups
- **Thank You**: Post-interview thank you emails
- **Rejection Follow-up**: Professional responses to rejections
- **Interview Follow-up**: Post-interview communications
- **Networking**: Professional networking outreach
- **Cold Outreach**: Initial contact emails
- **Partnership**: Business partnership proposals
- **Collaboration**: Project collaboration requests
- **Custom**: User-defined template types

### 🔧 Comprehensive Variable System

#### 50+ Dynamic Variables Across 9 Categories:

1. **Recipient Information** (8 variables)
   - `{{recipientName}}`, `{{recipientFirstName}}`, `{{recipientLastName}}`
   - `{{recipientGender}}`, `{{recipientEmail}}`, `{{recipientTitle}}`
   - `{{recipientDepartment}}`, `{{recipientLocation}}`

2. **Company Information** (6 variables)
   - `{{company}}`, `{{companySize}}`, `{{companyIndustry}}`
   - `{{companyWebsite}}`, `{{companyLocation}}`, `{{companyFounded}}`

3. **Position Information** (7 variables)
   - `{{position}}`, `{{positionLevel}}`, `{{positionDepartment}}`
   - `{{positionLocation}}`, `{{positionType}}`, `{{positionSalary}}`
   - `{{positionRequirements}}`

4. **Your Information** (10 variables)
   - `{{yourName}}`, `{{yourFirstName}}`, `{{yourLastName}}`
   - `{{yourEmail}}`, `{{yourTitle}}`, `{{yourCompany}}`
   - `{{yourLocation}}`, `{{yourLinkedIn}}`, `{{yourPortfolio}}`
   - `{{yourGitHub}}`

5. **Experience & Skills** (7 variables)
   - `{{yearsExperience}}`, `{{relevantExperience}}`, `{{keySkills}}`
   - `{{recentProjects}}`, `{{achievements}}`, `{{education}}`
   - `{{certifications}}`

6. **Motivation & Interest** (4 variables)
   - `{{whyInterested}}`, `{{companyValues}}`, `{{careerGoals}}`
   - `{{whatYouBring}}`

7. **Timing & Availability** (4 variables)
   - `{{availableDate}}`, `{{noticePeriod}}`, `{{preferredStartDate}}`
   - `{{timezone}}`

8. **Contact & Next Steps** (4 variables)
   - `{{phoneNumber}}`, `{{bestTimeToCall}}`, `{{preferredContact}}`
   - `{{nextSteps}}`

9. **Dynamic Content** (5 variables)
   - `{{currentDate}}`, `{{currentTime}}`, `{{dayOfWeek}}`
   - `{{randomFact}}`, `{{motivationalQuote}}`

### 🎨 Enhanced Template Builder

#### Features:
- **Real-time Preview**: See how your template looks before saving
- **Variable Search**: Search and filter variables by category or keyword
- **Drag & Drop Variables**: Easy insertion of variables into content
- **Template Validation**: Automatic validation of required fields
- **Advanced Options**: Difficulty level, target audience, and metadata
- **Tag System**: Organize templates with custom tags
- **Community Sharing**: Share templates with the community

#### Template Metadata:
- **Difficulty Level**: Easy, Medium, Advanced
- **Target Audience**: Description of intended users
- **Estimated Length**: Reading time estimation
- **Usage Statistics**: Track template performance

### ⚙️ User Settings & Defaults

#### Default Template Selection:
- **Primary Template**: Default template for job applications
- **Follow-up Template**: Default template for follow-up emails
- **Custom Content**: Override template content with custom subject/body
- **Template Management**: Easy switching between templates

#### Settings Features:
- **Template Library**: View and manage all your templates
- **Usage Analytics**: Track template performance and usage
- **Community Templates**: Access shared templates from other users
- **Template Ratings**: Rate and review community templates

### 🚀 Advanced Features

#### Smart Variable Replacement:
- **Context-Aware**: Variables adapt based on job and user data
- **Fallback Values**: Graceful handling of missing data
- **Dynamic Content**: Real-time generation of dates, quotes, and facts
- **Gender-Aware**: Automatic salutation based on recipient gender

#### Template Intelligence:
- **Auto-Categorization**: Suggest categories based on content
- **Variable Detection**: Automatically extract variables from templates
- **Usage Optimization**: Suggest improvements based on performance
- **Template Analytics**: Detailed insights into template effectiveness

## Database Schema

### Enhanced EmailTemplate Model:
```prisma
model EmailTemplate {
  id            String          @id @default(uuid())
  userId        String?
  user          User?           @relation("UserCreatedTemplates", fields: [userId], references: [id], onDelete: Cascade)

  name          String
  subject       String
  body          String          @db.Text
  description   String?         @db.Text

  category      TemplateCategory @default(GENERAL)
  templateType  TemplateType     @default(APPLICATION)
  tags          String[]         @default([])

  isSystemTemplate Boolean      @default(false)
  isPublic      Boolean         @default(false)
  isShared      Boolean         @default(false)
  usageCount    Int             @default(0)
  rating        Float           @default(0.0)
  ratingCount   Int             @default(0)
  variables     String[]        @default([])

  isCommunity     Boolean         @default(false)
  createdByName   String?

  likes           Int             @default(0)
  downloads       Int             @default(0)

  // Template metadata
  estimatedLength Int?           // Estimated reading time in minutes
  difficultyLevel String?        // EASY, MEDIUM, ADVANCED
  targetAudience  String?        // Description of target audience

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // Relations
  ratings       TemplateRating[]
  campaigns     Campaign[]
  jobs          Job[]
  jobBatches    JobBatch[]
  templateLikes TemplateLike[]
  usersWithDefault User[] @relation("UserDefaultTemplate")
  usersWithDefaultFollowUp User[] @relation("UserDefaultFollowUpTemplate")

  @@index([userId])
  @@index([category])
  @@index([templateType])
  @@index([isPublic])
  @@index([isCommunity])
}
```

### Enhanced User Model:
```prisma
model User {
  // ... existing fields ...

  // Default Template Selection
  defaultTemplateId String?
  defaultTemplate   EmailTemplate? @relation("UserDefaultTemplate", fields: [defaultTemplateId], references: [id], onDelete: SetNull)
  
  // Default Follow-up Template Selection
  defaultFollowUpTemplateId String?
  defaultFollowUpTemplate   EmailTemplate? @relation("UserDefaultFollowUpTemplate", fields: [defaultFollowUpTemplateId], references: [id], onDelete: SetNull)
  
  // Custom Default Template Content (for edited templates)
  customDefaultSubject String?
  customDefaultBody    String?
  
  // Custom Default Follow-up Template Content
  customDefaultFollowUpSubject String?
  customDefaultFollowUpBody    String?

  // ... rest of fields ...
}
```

## API Endpoints

### Template Management:
- `POST /api/templates/create` - Create new template
- `GET /api/templates/my-templates` - Get user's templates
- `GET /api/templates/community` - Get community templates
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### User Settings:
- `GET /api/user/default-template` - Get user's default templates
- `POST /api/user/default-template` - Set default template
- `DELETE /api/user/default-template` - Clear default template

### Template Operations:
- `POST /api/templates/[id]/duplicate` - Duplicate template
- `POST /api/templates/[id]/share` - Share template with community
- `POST /api/templates/[id]/rate` - Rate template
- `POST /api/templates/[id]/like` - Like template

## Usage Examples

### Creating a Template:
```typescript
const templateData = {
  name: "Senior Software Engineer Application",
  subject: "{{recipientName}} - {{position}} Application at {{company}}",
  body: `Hi {{recipientName}},

I am writing to express my strong interest in the {{position}} position at {{company}}. With {{yearsExperience}} years of experience in {{keySkills}}, I am excited about the opportunity to contribute to your team.

{{whyInterested}}

I would love to discuss how my background in {{recentProjects}} aligns with your team's needs.

Best regards,
{{yourName}}`,
  description: "Professional application template for senior software engineering positions",
  category: "TECH",
  templateType: "APPLICATION",
  tags: ["software", "engineering", "senior"],
  difficultyLevel: "MEDIUM",
  targetAudience: "Senior software engineers with 5+ years experience",
  isPublic: true,
  isCommunity: false
};
```

### Using Variables:
```typescript
// The system automatically replaces variables like:
// {{recipientName}} → "John Smith"
// {{company}} → "Tech Corp"
// {{position}} → "Senior Software Engineer"
// {{yourName}} → "Jane Doe"
// {{yearsExperience}} → "5"
// {{keySkills}} → "React, Node.js, TypeScript"
```

## Benefits

### For Users:
- **Personalization**: Highly personalized emails with 50+ variables
- **Efficiency**: Quick template creation with smart suggestions
- **Flexibility**: Adaptable to any industry or use case
- **Professional**: Industry-specific templates and best practices
- **Analytics**: Track template performance and effectiveness

### For Organizations:
- **Consistency**: Standardized communication across teams
- **Scalability**: Easy template management for large teams
- **Compliance**: Industry-specific templates ensure compliance
- **Collaboration**: Share templates across teams and departments
- **Insights**: Detailed analytics on communication effectiveness

## Future Enhancements

### Planned Features:
- **AI-Powered Suggestions**: Smart recommendations for template improvements
- **A/B Testing**: Test different template versions
- **Integration APIs**: Connect with external tools and platforms
- **Advanced Analytics**: Detailed performance metrics and insights
- **Template Marketplace**: Monetized template sharing platform
- **Multi-language Support**: Templates in multiple languages
- **Voice-to-Template**: Convert voice notes to email templates
- **Smart Scheduling**: AI-powered optimal send times

### Technical Improvements:
- **Performance Optimization**: Faster template processing
- **Caching**: Improved response times
- **Mobile Optimization**: Enhanced mobile experience
- **Offline Support**: Work without internet connection
- **Real-time Collaboration**: Multiple users editing templates simultaneously

## Getting Started

1. **Access the Enhanced Template Builder**: Navigate to `/templates/enhanced`
2. **Create Your First Template**: Use the comprehensive builder with 50+ variables
3. **Set Default Templates**: Configure your default application and follow-up templates
4. **Explore Community Templates**: Discover templates shared by other users
5. **Customize and Optimize**: Use analytics to improve your template performance

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

*This enhanced template system is designed to revolutionize email communication across all industries, providing users with the tools they need to create professional, personalized, and effective email templates.*
