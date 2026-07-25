export interface LeadFormValues {
  name: string;
  email: string;
  budgetRange: string;
  message: string;
}

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Tell us your name.";
  } else if (values.name.trim().length > 120) {
    errors.name = "That name is too long.";
  }

  if (!values.email.trim()) {
    errors.email = "We need an email to reply to.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "That doesn't look like a valid email.";
  }

  if (!values.budgetRange) {
    errors.budgetRange = "Pick the closest budget range.";
  }

  if (!values.message.trim()) {
    errors.message = "Add a few words about the project.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Give us a bit more detail (10+ characters).";
  } else if (values.message.trim().length > 2000) {
    errors.message = "Keep it under 2000 characters.";
  }

  return errors;
}
