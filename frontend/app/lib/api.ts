const API_BASE_URL = "http://localhost:3000";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
}

interface RegisterResponse {
  message: string;
  userId: number;
}

interface User {
  id: number;
  email: string;
  username: string;
}

// Types for Form
export type FormStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface Question {
  id: number;
  formId: number;
  questionText: string;
  questionType: "SHORT_ANSWER" | "LONG_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";
  options: string[];
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: number;
  title: string;
  description: string | null;
  status: FormStatus;
  userId: number;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  creator?: {
    id: number;
    username: string;
    email: string;
  };
  _count?: {
    responses: number;
  };
}

export interface FormWithQuestions extends Form {
  questions: Question[];
}

export interface FormQueryParams {
  search?: string;
  status?: FormStatus;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    email: string,
    username: string,
    password: string
  ): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  }

  // Form endpoints with filtering/sorting
  async getForms(query?: FormQueryParams): Promise<ApiResponse<Form[]>> {
    const qs = this.buildQueryString(query || {});
    return this.request<Form[]>(`/form${qs}`, {
      method: "GET",
    });
  }

  async getForm(id: number): Promise<ApiResponse<FormWithQuestions>> {
    return this.request<FormWithQuestions>(`/form/${id}`, {
      method: "GET",
    });
  }

  async createForm(data: { title: string; description?: string }): Promise<ApiResponse<Form>> {
    return this.request<Form>("/form", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateForm(id: number, data: { title?: string; description?: string; status?: FormStatus }): Promise<ApiResponse<Form>> {
    return this.request<Form>(`/form/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteForm(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/form/${id}`, {
      method: "DELETE",
    });
  }

  // Question endpoints
  async createQuestion(
    formId: number,
    data: {
      questionText: string;
      questionType: string;
      options?: string[];
      required?: boolean;
    }
  ): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/form/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(
    questionId: number,
    data: {
      questionText?: string;
      questionType?: string;
      options?: string[];
      required?: boolean;
      order?: number;
    }
  ): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/form/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(questionId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/form/questions/${questionId}`, {
      method: "DELETE",
    });
  }

  async reorderQuestions(formId: number, questionIds: number[]): Promise<ApiResponse<Question[]>> {
    return this.request<Question[]>(`/form/${formId}/questions/reorder`, {
      method: "PUT",
      body: JSON.stringify({ questionIds }),
    });
  }

  // Response endpoints
  async submitResponse(
    formId: number,
    responses: { questionId: number; answer: string | string[] }[]
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/form/${formId}/responses`, {
      method: "POST",
      body: JSON.stringify(responses),
    });
  }

  async getResponses(formId: number): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>(`/form/${formId}/responses`, {
      method: "GET",
    });
  }

  // Store token
  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Remove token
  removeToken(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiService = new ApiService();
export type { LoginResponse, RegisterResponse, User, ApiResponse };
