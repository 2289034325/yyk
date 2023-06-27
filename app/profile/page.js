"use client"

import { Box, Stack, TextField, Button } from '@mui/material'
import React from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
    name: yup
        .string('Enter your nick name')
        .test('len', 'Must be 2 to 5 characters', val => val.length >= 2 && val.length <= 5)
        .required('nick name is required'),
});

const Profile = () => {
    const formik = useFormik({
        initialValues: {
            email: 'foobar@example.com',
            name: 'foobar',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log(values)
        },
    });

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
        </Box>
    )
}

export default Profile