import { atom } from 'jotai'

import { persistAtom } from '../../utils/jotai/persistAtom'

export const chosenServerUrlAtom = persistAtom<string | undefined>('playground-chosen-sever-url', atom<string | undefined>(undefined))
