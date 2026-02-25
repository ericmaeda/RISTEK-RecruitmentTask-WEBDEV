// Dummy data for frontend development

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Question {
  id: string;
  formId: string;
  questionText: string;
  questionType: "SHORT_ANSWER" | "LONG_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";
  options?: string[];
  required: boolean;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

// Dummy users
export const dummyUsers: User[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "jane@example.com",
    name: "Jane Smith",
    createdAt: "2024-01-20T14:30:00Z",
  },
];

// Dummy forms
export const dummyForms: Form[] = [
  {
    id: "1",
    title: "Customer Feedback Survey",
    description: "Help us improve our services by providing your valuable feedback. This survey takes about 5 minutes to complete.",
    creatorId: "1",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    questions: [
      {
        id: "q1",
        formId: "1",
        questionText: "What is your full name?",
        questionType: "SHORT_ANSWER",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        formId: "1",
        questionText: "How satisfied are you with our service?",
        questionType: "MULTIPLE_CHOICE",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        required: true,
        order: 2,
      },
      {
        id: "q3",
        formId: "1",
        questionText: "Which features do you use most often?",
        questionType: "CHECKBOX",
        options: ["Dashboard", "Reports", "Settings", "API Integration", "Mobile App"],
        required: false,
        order: 3,
      },
      {
        id: "q4",
        formId: "1",
        questionText: "Please provide any additional comments or suggestions.",
        questionType: "LONG_ANSWER",
        required: false,
        order: 4,
      },
    ],
  },
  {
    id: "2",
    title: "Event Registration Form",
    description: "Register for our upcoming tech conference. Early bird registration ends on March 15th.",
    creatorId: "1",
    createdAt: "2024-02-05T11:30:00Z",
    updatedAt: "2024-02-10T14:20:00Z",
    questions: [
      {
        id: "q5",
        formId: "2",
        questionText: "Email Address",
        questionType: "SHORT_ANSWER",
        required: true,
        order: 1,
      },
      {
        id: "q6",
        formId: "2",
        questionText: "Which track are you interested in?",
        questionType: "DROPDOWN",
        options: ["Web Development", "Mobile Development", "Data Science", "DevOps", "UI/UX Design"],
        required: true,
        order: 2,
      },
      {
        id: "q7",
        formId: "2",
        questionText: "Dietary Requirements",
        questionType: "MULTIPLE_CHOICE",
        options: ["None", "Vegetarian", "Vegan", "Halal", "Gluten-Free"],
        required: false,
        order: 3,
      },
    ],
  },
  {
    id: "3",
    title: "Job Application Form",
    description: "Apply for open positions at our company. We're looking for talented individuals to join our team.",
    creatorId: "2",
    createdAt: "2024-02-08T16:45:00Z",
    updatedAt: "2024-02-08T16:45:00Z",
    questions: [
      {
        id: "q8",
        formId: "3",
        questionText: "Full Name",
        questionType: "SHORT_ANSWER",
        required: true,
        order: 1,
      },
      {
        id: "q9",
        formId: "3",
        questionText: "Position Applied For",
        questionType: "DROPDOWN",
        options: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Product Manager"],
        required: true,
        order: 2,
      },
      {
        id: "q10",
        formId: "3",
        questionText: "Years of Experience",
        questionType: "MULTIPLE_CHOICE",
        options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
        required: true,
        order: 3,
      },
      {
        id: "q11",
        formId: "3",
        questionText: "Technical Skills",
        questionType: "CHECKBOX",
        options: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Go", "AWS", "Docker", "Kubernetes"],
        required: true,
        order: 4,
      },
      {
        id: "q12",
        formId: "3",
        questionText: "Tell us about yourself and why you'd be a good fit",
        questionType: "LONG_ANSWER",
        required: true,
        order: 5,
      },
    ],
  },
  {
    id: "4",
    title: "Product Feedback",
    description: "Share your thoughts about our latest product release. Your feedback helps us build better products.",
    creatorId: "1",
    createdAt: "2024-02-12T08:00:00Z",
    updatedAt: "2024-02-15T10:30:00Z",
    questions: [
      {
        id: "q13",
        formId: "4",
        questionText: "How would you rate the product overall?",
        questionType: "MULTIPLE_CHOICE",
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
        required: true,
        order: 1,
      },
      {
        id: "q14",
        formId: "4",
        questionText: "What aspects need improvement?",
        questionType: "CHECKBOX",
        options: ["Performance", "User Interface", "Features", "Documentation", "Customer Support", "Pricing"],
        required: false,
        order: 2,
      },
      {
        id: "q15",
        formId: "4",
        questionText: "Detailed feedback",
        questionType: "LONG_ANSWER",
        required: false,
        order: 3,
      },
    ],
  },
  {
    id: "5",
    title: "Newsletter Subscription",
    description: "Subscribe to our monthly newsletter for the latest updates, tips, and exclusive content.",
    creatorId: "2",
    createdAt: "2024-02-14T12:00:00Z",
    updatedAt: "2024-02-14T12:00:00Z",
    questions: [
      {
        id: "q16",
        formId: "5",
        questionText: "Email Address",
        questionType: "SHORT_ANSWER",
        required: true,
        order: 1,
      },
      {
        id: "q17",
        formId: "5",
        questionText: "What topics interest you?",
        questionType: "CHECKBOX",
        options: ["Technology", "Business", "Design", "Marketing", "Career Advice"],
        required: false,
        order: 2,
      },
    ],
  },
];

// Helper functions
export function getFormById(id: string): Form | undefined {
  return dummyForms.find((form) => form.id === id);
}

export function getFormsByCreatorId(creatorId: string): Form[] {
  return dummyForms.filter((form) => form.creatorId === creatorId);
}

export function getUserById(id: string): User | undefined {
  return dummyUsers.find((user) => user.id === id);
}

export function validateUser(email: string, password: string): User | null {
  // For demo purposes, any password works
  const user = dummyUsers.find((u) => u.email === email);
  return user || null;
}
