// src/hooks/useDeviceType.ts
import { useState, useEffect } from 'react';

const isPrimaryTouchDevice = () => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
        return true;
    }
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return true;
    }
    return false;
};

export const useDeviceType = () => {
    const [isMobileOrTablet] = useState(isPrimaryTouchDevice());

    useEffect(() => {
        const handleResize = () => { };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobileOrTablet };
};