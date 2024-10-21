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
            console.debug(date);
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
        console.error(`Error parsing date: ${dateString}`, error);
        return dateString.toString(); // Return the original string if parsing fails
    }
}
