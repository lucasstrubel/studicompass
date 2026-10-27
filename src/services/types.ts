import type {
  AssistantEntry,
  AssistantFallback,
  DecisionHint,
  Deadline,
  ExamRecord,
  InboxItem,
  Module,
  MoodleProgress,
  Notification,
  Office,
  Program,
  Rule,
  Student,
} from "@/domain/types";

export interface ChannelContent {
  inbox: InboxItem[];
  deadlines: Deadline[];
}
export interface PosData extends ChannelContent {
  program: Program;
  student: Student;
  modules: Module[];
  exams: ExamRecord[];
}
export interface MoodleData extends ChannelContent {
  progress: MoodleProgress[];
}
export type MailData = ChannelContent;
export interface WebsiteData extends ChannelContent {
  notifications: Notification[];
}
export interface RulesData {
  rules: Rule[];
  offices: Office[];
  decisionHints: DecisionHint[];
}
export interface AssistantData {
  catalog: AssistantEntry[];
  fallback: AssistantFallback;
}

export interface PosService {
  load: () => Promise<PosData>;
}
export interface MoodleService {
  load: () => Promise<MoodleData>;
}
export interface MailService {
  load: () => Promise<MailData>;
}
export interface WebsiteService {
  load: () => Promise<WebsiteData>;
}
export interface RulesService {
  load: () => Promise<RulesData>;
}
export interface AssistantService {
  load: () => Promise<AssistantData>;
}

export interface ServiceData {
  pos: PosData;
  moodle: MoodleData;
  mail: MailData;
  website: WebsiteData;
  rules: RulesData;
  assistant: AssistantData;
}
export type ServiceKey = keyof ServiceData;
export interface Services {
  pos: PosService;
  moodle: MoodleService;
  mail: MailService;
  website: WebsiteService;
  rules: RulesService;
  assistant: AssistantService;
}
