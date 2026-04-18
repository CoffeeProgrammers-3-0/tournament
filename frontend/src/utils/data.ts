const ensureUtc = (dateStr: string): string => {
    if (!dateStr) return "";
    return (dateStr.includes('Z') || dateStr.includes('+'))
        ? dateStr
        : `${dateStr}Z`;
};

export const toLocalInput = (isoString?: string): string => {
    if (!isoString) return "";

    const date = new Date(ensureUtc(isoString));
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toUtcIso = (localString?: string): string => {
    if (!localString) return "";

    const date = new Date(localString);

    return date.toISOString();
};

export const formatDisplay = (dateInput: string | Date, lang: string) => {
    if (!dateInput) return "";

    const date = typeof dateInput === 'string'
        ? new Date(ensureUtc(dateInput))
        : dateInput;

    const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';

    return date.toLocaleString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};