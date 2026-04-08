export interface ChatSession {
  id: string;
  title: string | null;
  siteKey: string | null;
  documentId: string | null;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionTurn {
  turnIndex: number;
  question: string;
  answer: string;
  createdAt: string;
}

export interface SessionThread {
  session: ChatSession;
  turns: SessionTurn[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

