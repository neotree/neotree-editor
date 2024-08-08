import { create } from 'zustand';

export type AlertModalOptions = {
    title: string;
    message: string;
    buttonLabel: string;
    variant: 'error' | 'success' | 'info';
    onClose?: () => void;
};

type AlertModalState = AlertModalOptions & {
    isOpen: boolean;
    alert: (options: Partial<AlertModalOptions>) => void;
    close: () => void;
};

const defaults: AlertModalOptions = {
    title: '',
    message: '',
    buttonLabel: 'Ok',
    variant: 'info',
    onClose: undefined,
};

export const useAlertModal = create<AlertModalState>(set => ({
    isOpen: false,
    ...defaults,
    alert: (options: Partial<AlertModalOptions>) => set({ 
        isOpen: true, 
        ...defaults,
        ...options,
    }),
    close: () => set({ 
        isOpen: false, 
        onClose: undefined,
        ...defaults,
    }),
})); 
