export interface Message {
  id: number;
  sender: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  starred: boolean;
  tag: string;
  createdAt: string | null;
  archived: boolean;
}

export interface SmtpStatus {
  configured: boolean;
  active?: boolean;
  message: string;
}
