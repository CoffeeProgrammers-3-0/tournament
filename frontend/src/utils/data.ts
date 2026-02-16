export function convertData(dateString: string): string {
    const date = new Date(dateString);

    const minutes = String(date.getMinutes()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}.${month}.${year}`;
}

export default { convertData };
