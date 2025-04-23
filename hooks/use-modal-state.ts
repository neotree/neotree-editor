import { create } from 'zustand';

type Store = {
    modals: Record<string, boolean>,
    set: (params: Record<string, boolean>) => void;
    isOpen: (modal: string) => boolean;
    open: (modal: string) => void;
    close: (modal: string) => void;
    toggle: (modal: string) => void;
};

export const useModalState = create<Store>((set, getState) => {
    return {
        modals: {},

        open(modal) {
            set(prev => ({ modals: { ...prev.modals, [modal]: true, } }));
        },

        toggle(modal) {
            const state = getState().modals;
            set(prev => ({ modals: { ...prev.modals, [modal]: !state[modal], } }));
        },

        close(modal) {
            set(prev => ({ modals: { ...prev.modals, [modal]: false, } }));
        },

        isOpen(modal) {
            const state = getState().modals;
            return !!state[modal];
        },

        set(params) {
            set(prev => ({ modals: { ...prev.modals, ...params, } }));
        },
    };
});
