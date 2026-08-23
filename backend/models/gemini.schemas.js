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
