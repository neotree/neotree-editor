import { create } from 'zustand';

type Options = {
    title: string;
    message: string;
    positiveLabel: string;
    negativeLabel: string;
    danger?: boolean;
};

type ConfirmModalState = Options & {
    isOpen: boolean;
    onConfirm?: () => void;
    confirm: (onConfirm: () => void, options?: Partial<Options>) => void;
    close: () => void;
};

const defaults: Options = {
    danger: false,
    title: 'Confirm',
    message: 'Are you sure?',
    positiveLabel: 'Ok',
    negativeLabel: 'Cancel',
};

export const useConfirmModal = create<ConfirmModalState>(set => ({
    isOpen: false,
    ...defaults,
    confirm: (onConfirm: () => void, options?: Partial<Options>) => set({ 
        isOpen: true, 
        ...defaults,
        ...options,
        onConfirm,
    }),
    close: () => set({ 
        isOpen: false, 
        onConfirm: undefined,
        ...defaults,
    }),
})); 
