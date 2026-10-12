export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  email: string;
  name?: string;
  [key: string]: string | undefined;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

export interface EmailJob {
  template: EmailTemplate;
  recipients: Recipient[];
  smtpConfig: SmtpConfig;
}

export type RootStackParamList = {
  Home: undefined;
  TemplateEditor: {templateId?: string};
  TemplateList: undefined;
  ImportExcel: undefined;
  Preview: {
    templateId: string;
    recipients: Recipient[];
  };
  SmtpSettings: undefined;
  SendProgress: {
    templateId: string;
    recipients: Recipient[];
  };
};
