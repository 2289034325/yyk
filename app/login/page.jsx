"use client"

import { Box, Stack, TextField, Button, Hidden, Snackbar, Alert } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { providers, signIn, getSession, csrfToken } from "next-auth/react";
import { useRouter } from 'next/navigation'

const validationSchema = yup.object({
    email: yup
        .string('メールアドレスを入力してください')
        .required('メールアドレスを入力してください'),
    password: yup
        .string('パスワードを入力してください')
        .required('パスワードを入力してください')
});

const Login = () => {
    const router = useRouter();

    const [sbState, setSbState] = React.useState({
        sbOpen: false,
        sbSeverity: 'success',
        sbMessage: ''
    });
    const { sbMessage, sbSeverity, sbOpen } = sbState;

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false
            }).then(res => {
                console.log(res)
                if (res.ok && !res.error)
                    router.push('/')
                else {
                    setSbState({ sbOpen: true, sbSeverity: 'error', sbMessage: '入力されたメールアドレスまたはパスワードに誤りがあります。' })
                }
            })
        },
    });

    return (
        <Box display='flex' justifyContent='center' className=' mt-52'>
            <form onSubmit={formik.handleSubmit} >
                <Stack direction="column" className='w-48 sm:w-96'>
                    <TextField
                        id="email"
                        label="メールアドレス"
                        variant="standard"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        sx={{ mt: '40px' }}
                        id="password"
                        type="password"
                        label="パスワード"
                        variant="standard"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <Button
                        sx={{ mt: '60px' }}
                        variant="contained"
                        color="primary"
                        type="submit">ログイン</Button>
                </Stack>
            </form>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={sbOpen}
                onClose={() => { setSbState({ ...sbState, sbOpen: false }) }}
                message={sbMessage}
                autoHideDuration={2000}
            >
                <Alert severity={sbSeverity} sx={{ width: '100%' }}>
                    {sbMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Login