export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    if (diffInDays === -1) return "Yesterday";
    if (diffInDays > -7) return `${Math.abs(diffInDays)} days ago`;
    return `${Math.floor(Math.abs(diffInDays) / 7)} weeks ago`;
  }

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Tomorrow";
  if (diffInDays < 7) return `In ${diffInDays} days`;
  return `In ${Math.floor(diffInDays / 7)} weeks`;
}
