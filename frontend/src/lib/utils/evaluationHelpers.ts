// Helper function to format date
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Helper function to get difficulty color
export const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status color
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'reviewed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to calculate average score
export const calculateAverageScore = (evaluations: Array<{ overall_score?: number }>) => {
  const validScores = evaluations.filter(evaluation => evaluation.overall_score !== undefined);
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, evaluation) => acc + (evaluation.overall_score || 0), 0);
  return sum / validScores.length;
};

// Helper function to get score color based on value
export const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
};

// Helper function to sort evaluations
export const sortEvaluations = (evaluations: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  return [...evaluations].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'score':
        aValue = a.overall_score || 0;
        bValue = b.overall_score || 0;
        break;
      case 'task':
        aValue = a.task_id;
        bValue = b.task_id;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

// Helper function to filter evaluations
export const filterEvaluations = (evaluations: any[], filters: {
  status?: string;
  difficulty?: string;
  language?: string;
  minScore?: number;
  maxScore?: number;
}) => {
  return evaluations.filter(evaluation => {
    if (filters.status && evaluation.status !== filters.status) return false;
    if (filters.difficulty && evaluation.difficulty_level !== filters.difficulty) return false;
    if (filters.language && evaluation.programming_language !== filters.language) return false;
    if (filters.minScore && (evaluation.overall_score || 0) < filters.minScore) return false;
    if (filters.maxScore && (evaluation.overall_score || 0) > filters.maxScore) return false;
    return true;
  });
};