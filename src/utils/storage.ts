import AsyncStorage from '@react-native-async-storage/async-storage';
import {EmailTemplate, SmtpConfig} from '../types';

const TEMPLATES_KEY = '@bulk_email_templates';
const SMTP_CONFIG_KEY = '@bulk_email_smtp_config';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Template Storage
export const saveTemplate = async (
  template: EmailTemplate,
): Promise<void> => {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = {...template, updatedAt: new Date().toISOString()};
  } else {
    templates.push(template);
  }
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getTemplates = async (): Promise<EmailTemplate[]> => {
  const data = await AsyncStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTemplateById = async (
  id: string,
): Promise<EmailTemplate | null> => {
  const templates = await getTemplates();
  return templates.find(t => t.id === id) || null;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const templates = await getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
};

// SMTP Config Storage
export const saveSmtpConfig = async (config: SmtpConfig): Promise<void> => {
  await AsyncStorage.setItem(SMTP_CONFIG_KEY, JSON.stringify(config));
};

export const getSmtpConfig = async (): Promise<SmtpConfig | null> => {
  const data = await AsyncStorage.getItem(SMTP_CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};
