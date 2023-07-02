"use client";

import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
// import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { useRouter } from 'next/navigation';
import BookSetting from "../../components/bookSetting";
import { useAuthContext } from '../provider/auth';

const SiteHeader = () => {
    // const { data: session } = useSession()
    const { user, setToken } = useAuthContext()

    const router = useRouter();

    const [providers, setProviders] = useState(null)
    const [toggleDropdown, setToggleDropdown] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const [isSetDlgOpen, setIsSetDlgOpen] = useState(false)

    const menuOpen = anchorEl ? true : false;

    // const { user } = useAuthContext()
    // const router = useRouter()
    const rc = useRef(0)
    useEffect(() => {
        rc.current++

        console.log(user, rc.current)
        if (!user)
            router.push("/login")
    });

    // useEffect(() => {
    //     (async () => {
    //         const res = await getProviders();
    //         setProviders(res);
    //     })();
    // }, []);

    const meClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const meClose = () => {
        setAnchorEl(null);
    };

    const confirmSetting = () => {

    }

    return (
        <nav className='flex-between w-full mb-3'>
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
                {user ? (
                    <div className='flex items-center gap-3 md:gap-5'>

                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={meClick}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.substring(0, 1)}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={menuOpen}
                            onClose={meClose}
                            onClick={meClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={() => { router.push('/profile'); }}>
                                <Avatar /> Profile
                            </MenuItem>
                            <Divider />
                            {user?.role == 'admin' &&
                                <MenuItem onClick={() => setIsSetDlgOpen(true)}>
                                    <ListItemIcon>
                                        <Settings fontSize="small" />
                                    </ListItemIcon>
                                    Settings
                                </MenuItem>
                            }
                            <MenuItem onClick={() => setToken('')}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                ) : (
                    <button
                        type='button'
                        onClick={() => { router.push('/login') }}
                        className='black_btn'>
                        Sign in
                    </button>
                )}
            </div>

            {isSetDlgOpen && <BookSetting isOpen={isSetDlgOpen} handleClose={() => setIsSetDlgOpen(false)} />}

        </nav>
    );
};

export default SiteHeader;