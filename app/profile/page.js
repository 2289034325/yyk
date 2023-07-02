"use client"

import { Alert, Box, Button, Snackbar, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useSession } from "next-auth/react";
import { useMemo } from 'react';
import * as yup from 'yup';
import { useAuthContext } from '../../components/provider/auth';
import { useState } from 'react';

const validationSchema = yup.object({
    name: yup
        .string('ニックネームを入力してください')
        .test('len', '２文字から５文字まで入力してください', val => val.length >= 2 && val.length <= 5)
        .required('ニックネームを入力してください'),
});

const Profile = () => {
    // const { data: session, update } = useSession();
    const { user, token, setToken } = useAuthContext()

    const [sbState, setSbState] = useState({
        sbOpen: false,
        sbSeverity: 'success',
        sbMessage: ''
    });
    const { sbMessage, sbSeverity, sbOpen } = sbState;

    //プロファイルを変更
    const editProfile = (params) => {
        return fetch(`http://localhost:3000/api/user`,
            {
                method: "PUT",
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify(params)
            });
    }
    const editMutation = useMutation(editProfile);

    const formik = useFormik({
        initialValues: {
            email: user?.email ?? '',
            name: user?.name ?? '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            await editMutation.mutateAsync({ id: user?.id, name: values.name }, {
                onSuccess: async (res) => {
                    console.log(res)
                    if (res.ok) {
                        // update({ name: values.name })
                        const token = await res.text()
                        setToken(token)
                        setSbState({ ...sbState, sbSeverity: 'success', sbOpen: true, sbMessage: '完了しました' })
                    }
                    else {
                        setSbState({ ...sbState, sbSeverity: 'error', sbOpen: true, sbMessage: res.text() })
                    }
                },
                onError: (e) => {
                    setSbState({ ...sbState, sbSeverity: 'error', sbOpen: true, sbMessage: 'エラー' })
                }
            })
        },
    });

    useMemo(() => {
        if (!user)
            return

        formik.setFieldValue("email", user.email)
        formik.setFieldValue("name", user.name)
    }, [user])

    return (
        <Box display='flex' justifyContent='center'>
            <form onSubmit={formik.handleSubmit} >
                <Stack direction="column" className='w-48 sm:w-96'>
                    <TextField
                        disabled
                        id="email"
                        label="メールアドレス"
                        variant="standard"
                        value={formik.values.email}
                    />
                    <TextField
                        sx={{ mt: '40px' }}
                        id="name"
                        label="ニックネーム"
                        variant="standard"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <Button
                        sx={{ mt: '40px' }}
                        variant="contained"
                        color="primary"
                        type="submit">確認</Button>
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

export default Profile