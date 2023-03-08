import { useContext } from 'react';

import { WalletContext, WalletContextProps } from "../../../Contexts/WalletStatusContext";

export function useWalletContext(): WalletContextProps {
    return useContext(WalletContext);
}
