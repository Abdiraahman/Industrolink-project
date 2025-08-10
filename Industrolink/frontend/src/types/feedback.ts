export interface FeedbackItem {
    id: string;
    studentId: string;
    supervisorId: string;
    lecturerId?: string;
    content: string;
    rating: number;
    date: Date;
    type: 'weekly' | 'monthly' | 'final' | 'general';
    status: 'pending' | 'submitted' | 'reviewed';
  }
  
  export interface SupervisorFeedback {
    id: string;
    supervisor: string;
    date: string;
    feedback: string;
    rating: number;
    studentId: string;
    weekNumber?: number;
  }
  
  export interface WeeklyEvaluation {
    id: string;
    studentId: string;
    weekNumber: number;
    workQuality: number;
    punctuality: number;
    initiative: number;
    communication: number;
    overallRating: number;
    comments: string;
    evaluatedBy: string;
    evaluatedAt: Date;
  }
  
  export interface FinalEvaluation {
    id: string;
    studentId: string;
    internshipId: string;
    technicalSkills: number;
    professionalSkills: number;
    overallPerformance: number;
    recommendations: string;
    strengths: string[];
    areasForImprovement: string[];
    wouldRecommendForHire: boolean;
    evaluatedBy: string;
    evaluatedAt: Date;
  }
  
  export interface FeedbackStats {
    totalFeedbacks: number;
    averageRating: number;
    weeklyFeedbacks: number;
    monthlyFeedbacks: number;
    finalEvaluations: number;
  }