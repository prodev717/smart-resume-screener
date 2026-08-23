export const resumeSchema = {
  type: 'object',
  properties: {
    is_resume: {
      type: 'boolean',
    },
    candidate: {
      type: ['object', 'null'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        summary: { type: 'string' },

        skills: {
          type: 'array',
          items: { type: 'string' },
        },

        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              degree: { type: 'string' },
              institution: { type: 'string' },
              field: { type: 'string' },
              start_year: { type: 'string' },
              end_year: { type: 'string' },
            },
            required: [
              'degree',
              'institution',
              'field',
              'start_year',
              'end_year',
            ],
          },
        },

        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              role: { type: 'string' },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              description: { type: 'string' },
            },
            required: [
              'company',
              'role',
              'start_date',
              'end_date',
              'description',
            ],
          },
        },

        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              technologies: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: [
              'name',
              'description',
              'technologies',
            ],
          },
        },

        certifications: {
          type: 'array',
          items: { type: 'string' },
        },

        achievements: {
          type: 'array',
          items: { type: 'string' },
        },

        links: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: [
        'name',
        'email',
        'phone',
        'location',
        'summary',
        'skills',
        'education',
        'experience',
        'projects',
        'certifications',
        'achievements',
        'links',
      ],
    },
  },
  required: ['is_resume', 'candidate'],
};



export const jobDescriptionSchema = {
  type: "object",
  properties: {
    is_job_description: {
      type: "boolean",
    },

    job: {
      type: ["object", "null"],
      properties: {
        title: {
          type: "string",
        },

        company: {
          type: "string",
        },

        location: {
          type: "string",
        },

        employment_type: {
          type: "string",
        },

        work_mode: {
          type: "string",
        },

        experience_required: {
          type: "string",
        },

        salary: {
          type: "string",
        },

        summary: {
          type: "string",
        },

        responsibilities: {
          type: "array",
          items: { type: "string" },
        },

        required_skills: {
          type: "array",
          items: { type: "string" },
        },

        preferred_skills: {
          type: "array",
          items: { type: "string" },
        },

        required_qualifications: {
          type: "array",
          items: { type: "string" },
        },

        preferred_qualifications: {
          type: "array",
          items: { type: "string" },
        },

        education: {
          type: "array",
          items: { type: "string" },
        },

        certifications: {
          type: "array",
          items: { type: "string" },
        },

        soft_skills: {
          type: "array",
          items: { type: "string" },
        },

        benefits: {
          type: "array",
          items: { type: "string" },
        },

        keywords: {
          type: "array",
          items: { type: "string" },
        },

        application_deadline: {
          type: "string",
        },

        application_url: {
          type: "string",
        },
      },

      required: [
        "title",
        "company",
        "location",
        "employment_type",
        "work_mode",
        "experience_required",
        "salary",
        "summary",
        "responsibilities",
        "required_skills",
        "preferred_skills",
        "required_qualifications",
        "preferred_qualifications",
        "education",
        "certifications",
        "soft_skills",
        "benefits",
        "keywords",
        "application_deadline",
        "application_url",
      ],
    },
  },

  required: ["is_job_description", "job"],
};



export const screeningSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
    },
    reason: {
      type: "string",
    },
  },
  required: ["score", "reason"],
};