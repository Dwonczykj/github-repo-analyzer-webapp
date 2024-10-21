import logger from '@/config/logging';
export function formatDate(dateString: string | Date | undefined): string {
    if (!dateString) {
        return '';
    }
    try {
        if (typeof dateString === 'undefined') {
            return '';
        }
        else if (typeof dateString === 'string') {
            const date = new Date(dateString);
            logger.debug(date);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } else {
            return dateString.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    } catch (error) {
        logger.error(`Error parsing date: ${dateString}`, error);
        return dateString.toString(); // Return the original string if parsing fails
    }
}

export function calculateDuration(startDate: Date, endDate: Date): string {
    const durationMs = endDate.getTime() - startDate.getTime();
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}
