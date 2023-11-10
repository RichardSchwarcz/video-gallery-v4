export function truncateTitle(title: string, limit = 60): string {
  if (title.length <= limit) {
    return title;
  }
  const lastSpace = title.lastIndexOf(" ", limit);
  if (lastSpace === -1) {
    return `${title.slice(0, limit)}...`;
  }
  return `${title.slice(0, lastSpace)}...`;
}
