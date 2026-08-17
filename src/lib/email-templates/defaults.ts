// Built-in defaults used by the "Reset to default" button in the
// Admin > Email templates editor. Keep aligned with the seed migration.

export type TemplateLang = 'sl' | 'en'

export interface TemplateDefault {
  subject: string
  body: string
  footer: string | null
  placeholders: string[]
  description: string
}

export const TEMPLATE_DEFAULTS: Record<string, Record<TemplateLang, TemplateDefault>> = {
  driver_assignment: {
    sl: {
      subject: 'Nov razpored prevoza — {{date}}',
      body: `Pozdravljen/a {{driver_name}},\n\ndodeljen/a si kot voznik/ica za prevzem hrane:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}\n\nHvala za tvojo pomoč!`,
      footer: 'Lep pozdrav,\nKruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: 'Sent when a driver is newly assigned to a stop.',
    },
    en: {
      subject: 'New delivery assignment — {{date}}',
      body: `Hello {{driver_name}},\n\nyou have been assigned as the driver for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}\n\nThank you for your help!`,
      footer: 'Best regards,\nKruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: 'Sent when a driver is newly assigned to a stop.',
    },
  },
  driver_change: {
    sl: {
      subject: 'Sprememba razporeda — {{date}}',
      body: `Pozdravljen/a {{driver_name}},\n\nobveščamo te o spremembi na tvoji dodelitvi:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}\n\nČe imaš vprašanja, se obrni na razdeljevalca.`,
      footer: 'Lep pozdrav,\nKruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: 'Sent when an assignment is changed.',
    },
    en: {
      subject: 'Schedule change — {{date}}',
      body: `Hello {{driver_name}},\n\nthere is an update to your assignment:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}\n\nIf you have any questions, please contact the distributor.`,
      footer: 'Best regards,\nKruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: 'Sent when an assignment is changed.',
    },
  },
  driver_reminder: {
    sl: {
      subject: 'Opomnik: jutri si na vrsti — {{date}}',
      body: `Pozdravljen/a {{driver_name}},\n\nprijazno te opominjamo, da si jutri dodeljen/a za prevzem hrane:\n\nDatum: {{date}}\nLokacija: {{location}}\n{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}\n\nHvala in lep dan!`,
      footer: 'Kruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: '24-hour reminder before a scheduled pickup.',
    },
    en: {
      subject: "Reminder: you're on the schedule tomorrow — {{date}}",
      body: `Hello {{driver_name}},\n\nfriendly reminder that you are scheduled tomorrow for a food pickup:\n\nDate: {{date}}\nLocation: {{location}}\n{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}\n\nThank you and have a great day!`,
      footer: 'Kruh življenja',
      placeholders: ['driver_name', 'date', 'location', 'coordinator'],
      description: '24-hour reminder before a scheduled pickup.',
    },
  },
  test_email: {
    sl: {
      subject: 'Testno sporočilo · {{app_name}}',
      body: `Pozdravljen/a {{person_name}},\n\nto je testno sporočilo poslano iz administratorske strani ob {{date}} {{time}}.\nČe si ga prejel/a, pošiljatelj deluje pravilno.`,
      footer: 'Lep pozdrav,\n{{app_name}}',
      placeholders: ['person_name', 'date', 'time', 'app_name'],
      description: 'Sent by the Email Queue "Send test email" button.',
    },
    en: {
      subject: 'Test message · {{app_name}}',
      body: `Hello {{person_name}},\n\nthis is a test message sent from the admin Email Queue at {{date}} {{time}}.\nIf you received it, the sender is working correctly.`,
      footer: 'Best regards,\n{{app_name}}',
      placeholders: ['person_name', 'date', 'time', 'app_name'],
      description: 'Sent by the Email Queue "Send test email" button.',
    },
  },
}

export const ALL_PLACEHOLDERS = [
  'person_name',
  'driver_name',
  'coordinator_name',
  'coordinator',
  'date',
  'time',
  'location',
  'location_name',
  'recipient_summary',
  'app_name',
] as const
