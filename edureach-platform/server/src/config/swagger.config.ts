export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "EduReach College Intelligence Platform API",
    version: "1.0.0",
    description:
      "Enterprise REST API specification for EduReach College Intelligence Platform. Includes authentication, admissions management, AI Counselor RAG query engine, student academic intelligence, and faculty grading tools.",
    contact: {
      name: "EduReach Engineering Team",
      email: "admissions@edureach.edu.in",
    },
  },
  servers: [
    {
      url: "http://localhost:5050",
      description: "Local Development Environment",
    },
    {
      url: "https://edureach-server.onrender.com",
      description: "Production Environment (Render)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["student", "faculty", "admin"] },
          department: { type: "string" },
        },
      },
      Application: {
        type: "object",
        properties: {
          id: { type: "string" },
          studentName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          course: { type: "string" },
          twelfthPercentage: { type: "number" },
          entranceExam: { type: "string" },
          entranceRank: { type: "number" },
          status: { type: "string", enum: ["Pending", "Under Review", "Accepted", "Rejected"] },
        },
      },
      PredictionResult: {
        type: "object",
        properties: {
          overallEligibility: { type: "string" },
          recommendedBranch: { type: "string" },
          aiCounselorInsight: { type: "string" },
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                branchName: { type: "string" },
                probability: { type: "string" },
                matchPercentage: { type: "number" },
                quotaType: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        summary: "API Health Check",
        tags: ["System"],
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register new user (Student / Faculty)",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Alex Rivera" },
                  email: { type: "string", example: "alex@edureach.edu" },
                  password: { type: "string", example: "securePass123" },
                  role: { type: "string", enum: ["student", "faculty"] },
                  department: { type: "string", example: "Computer Science & Engineering" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login with Email / Faculty ID & Password",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "student@edureach.edu" },
                  password: { type: "string", example: "password123" },
                  role: { type: "string", enum: ["student", "faculty", "admin"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful with JWT" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get currently logged-in user profile",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User profile returned" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/chat/message": {
      post: {
        summary: "Send query to Gemini RAG AI Counselor",
        tags: ["AI Counselor RAG"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: { type: "string", example: "What is the fee structure for B.Tech CSE?" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "RAG Answer returned with context citations" },
        },
      },
    },
    "/api/predictor/predict": {
      post: {
        summary: "Predict college admission branches based on entrance rank",
        tags: ["Admissions Predictor"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["twelfthPercentage"],
                properties: {
                  entranceExam: { type: "string", example: "TS EAMCET" },
                  entranceRank: { type: "number", example: 4500 },
                  twelfthPercentage: { type: "number", example: 89.5 },
                  category: { type: "string", example: "General" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Prediction probabilities generated" },
        },
      },
    },
    "/api/applications": {
      post: {
        summary: "Submit admission application",
        tags: ["Admissions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Application" },
            },
          },
        },
        responses: {
          201: { description: "Application created" },
        },
      },
    },
    "/api/applications/all": {
      get: {
        summary: "Get all applications for Admin dashboard",
        tags: ["Admissions"],
        responses: {
          200: { description: "Application list and stats returned" },
        },
      },
    },
    "/api/student/portal-data": {
      get: {
        summary: "Get complete Student Dashboard ERP data (Attendance, CGPA, Exams, Placements)",
        tags: ["Student ERP"],
        responses: {
          200: { description: "Student dashboard metrics" },
        },
      },
    },
    "/api/student/academic-risk": {
      get: {
        summary: "AI Academic Risk & Detention Probability Prediction",
        tags: ["Student ERP"],
        responses: {
          200: { description: "Academic risk prediction data" },
        },
      },
    },
    "/api/faculty/dashboard": {
      get: {
        summary: "Get Faculty Dashboard data (Courses, Stats, Today's Classes)",
        tags: ["Faculty ERP"],
        responses: {
          200: { description: "Faculty dashboard data" },
        },
      },
    },
    "/api/faculty/evaluate-assignment": {
      post: {
        summary: "AI Assignment Evaluator with plagiarism check",
        tags: ["Faculty ERP"],
        responses: {
          200: { description: "Evaluation breakdown with rubric scores" },
        },
      },
    },
    "/api/upload/image": {
      post: {
        summary: "Upload profile image / avatar to Cloudinary",
        tags: ["Cloud Storage"],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Image uploaded and CDN url returned" },
        },
      },
    },
    "/api/upload/document": {
      post: {
        summary: "Upload document / PDF to Cloudinary / Storage",
        tags: ["Cloud Storage"],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  document: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Document uploaded successfully" },
        },
      },
    },
    "/api/student/hall-ticket/pdf": {
      get: {
        summary: "Stream official examination Hall Ticket PDF",
        tags: ["PDF Documents"],
        responses: {
          200: { description: "Official Hall Ticket PDF binary stream" },
        },
      },
    },
    "/api/results/{id}/pdf": {
      get: {
        summary: "Stream authenticated Semester Grade Card PDF",
        tags: ["PDF Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Result ID or 'latest'",
          },
        ],
        responses: {
          200: { description: "Official Grade Card PDF binary stream" },
        },
      },
    },
  },
};
