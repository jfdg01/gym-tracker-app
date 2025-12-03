export const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const searchFilter = <T extends { name: string }>(items: T[], query: string): T[] => {
    if (!query) return items;
    const normalizedQuery = normalizeText(query);
    return items.filter(item => normalizeText(item.name).includes(normalizedQuery));
};
