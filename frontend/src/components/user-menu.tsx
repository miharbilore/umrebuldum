"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Settings, UserPen, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" suppressHydrationWarning>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>{getInitials(session.user.name || session.user.email)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                        {session.user.role && (
                            <p className="text-xs text-primary font-semibold uppercase mt-1">
                                {session.user.role === 'USER' ? 'UMRECI' :
                                    session.user.role === 'GUIDE' ? 'REHBER' :
                                        session.user.role === 'ORGANIZATION' ? 'ORGANIZASYON' : session.user.role}
                            </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={session.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Panelim</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/rehber/${session.user.id}-profil`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Açık Profilimi Gör</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={session.user.role === "ADMIN" ? "/admin/settings" : "/dashboard/profile"} className="cursor-pointer">
                        <UserPen className="mr-2 h-4 w-4" />
                        <span>Profilimi Düzenle</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={session.user.role === "ADMIN" ? "/admin/settings" : "/dashboard/settings"} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Hesap Ayarları</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
