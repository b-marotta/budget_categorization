import { Plus, X } from 'lucide-react'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'

import BankConnection from './bank-connection'

export default function LinkDrawer() {
    return (
        <Drawer direction="right">
            <DrawerTrigger>
                <div className="rounded-full border">
                    <Plus className="p-2" size={46} />
                </div>
            </DrawerTrigger>
            <DrawerContent className="w-full! max-w-[unset]">
                <DrawerHeader>
                    <DrawerTitle className="mb-2 flex justify-between gap-2 text-xl">
                        Connetti la tua Banca
                        <DrawerClose>
                            <X size={22} />
                        </DrawerClose>
                    </DrawerTitle>
                    <DrawerDescription className="text-base">
                        Seleziona la tua banca per connettere i tuoi conti in modo sicuro tramite
                        Open Banking.
                    </DrawerDescription>
                </DrawerHeader>
                <BankConnection />
            </DrawerContent>
        </Drawer>
    )
}
