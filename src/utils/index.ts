export const formatNumber = (num: number, decimals = 0): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};