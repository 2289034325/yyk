"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

const SiteHeader = () => {
    const { data: session } = useSession();

    const [providers, setProviders] = useState(null);
    const [toggleDropdown, setToggleDropdown] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await getProviders();
            setProviders(res);
        })();
    }, []);

    return (
        <nav className='flex-between w-full mb-16 pt-3'>
            <Link href='/' className='flex gap-2 flex-center'>
                <Image
                    src='/assets/images/logo.svg'
                    alt='logo'
                    width={30}
                    height={30}
                    className='object-contain'
                />
                <p className='logo_text'>ひとみ師匠</p>
            </Link>

            {/* Desktop Navigation */}
            <div className='sm:flex hidden'>
                {session?.user ? (
                    <div className='flex items-center gap-3 md:gap-5'>
                        <Link href='/profile'>
                            <span className='font-medium text-blue-600 dark:text-blue-500 hover:underline'>{session?.user.name}</span>
                        </Link>
                        <button type='button' onClick={signOut} className='outline_btn'>
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        type='button'
                        onClick={() => { signIn(); }}
                        className='black_btn'>
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
};

export default SiteHeader;