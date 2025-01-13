import { useRouter } from 'next/router';

import { FormControl, FormGroup, InputLabel, Input, Typography, Button, styled, FormHelperText, Autocomplete, TextField, CircularProgress } from "@mui/material";
import React, {useState, useEffect } from "react";
import getConnection from '../../../lib/dbsqlazure';

import DynamicBreadCrumbs from '../../../components/DynamicBreadCrumbs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


import { Box } from "@mui/material";

// Validation - npm install react-hook-form
import { useForm, Controller } from 'react-hook-form';

import styles from '../AllUsers.module.css';

const UserContainer = styled(FormGroup)`
    width: 50%;
    margin: 5% auto 0 auto;
    background-color: white;
`

const UserDetails = () => {
    const [loading, setLoading] = useState(true); // Loading state
    const router = useRouter();
    const { id } = router.query; // Extract the dynamic route parameter

    const [db, setDb] = useState(null);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const [isDataReady, setIsDataReady] = useState(false);

    const [listTipoUtente, setListTipoUtente] = useState([]);

    // Validation
    const initialValues = {
        nome: '',
        cognome: '',
        email: '',
        datadinascita: '',
        phone: '',
        idtipoutente: 0,
        tipoutente: ''
    };

    // Validation
   /*  const { handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: initialValues
    }); */
    const [formValues, setFormValues] = useState(initialValues);
    const {
        control,
        watch,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: formValues
    });

    // Validation
    const onSubmit = async (data, event) => {
        console.log('Form Submitted:', data);
        const clickedButton = event.nativeEvent.submitter.name; // Access submitter's name
        // Get the name of the button clicked

        if (clickedButton === 'update') {
            UpdateUserData(data);
        } else if (clickedButton === 'delete') {
            DeleteUserData(data);
        }
    };

    // Validation
    const watchAllFields = watch(); // Watch all fields for enabling the button.
    // Validation
    const isFormValid = () => {
        const isValid = watchAllFields.nome &&
        watchAllFields.cognome &&
        watchAllFields.email &&
        watchAllFields.phone &&
        watchAllFields.datadinascita &&
        watchAllFields.tipoutente &&
        !errors.tipoutente && // No errors on tipoutente
        !errors.nome && // No errors on name
        !errors.cognome && // No errors on surname
        !errors.email && // No errors on email
        !errors.phone && // No errors on phone
        !errors.datadinascita && // No errors on datadinascita
        Object.keys(errors).length === 0;
        // console.log('errors.tipoutente: ' + errors.tipoutente);
        // console.log('isValid: ' + isValid);
        return (
            isValid
        );
    };

    const UpdateUserData = async (user) => {
        console.log('UpdateUserData dataUser:', user);

        if (!db) {
            console.error('Database is not initialized');
            return;
        }

        try {
            
            // Check if the user exists before addition
            const checkUser = db.exec(`SELECT * FROM T_Utente WHERE Id = ${id}`);
            console.log('UpdateUserData - ' + `SELECT * FROM T_Utente WHERE Id = ${id}`);

            if (!checkUser || checkUser.length === 0) {
                console.warn("User not found. Nothing to update.");
                return;
            }
    
            
            // Update the user
            const query = `
                UPDATE [T_Utente]
                SET [Nome] = '${user.nome}'
                    ,[Cognome] = '${user.cognome}'
                    ,[Email] = '${user.email}'
                    ,[Phone] = '${user.phone}'
                    ,[DataDiNascita] = '${user.datadinascita}'
                    ,[IdTipoUtente] = ${user.tipoutente.value}
                WHERE Id = ${id}
                `;
            db.run(query);
            console.log("User updated successfully.");
    
            // Redirect to AllUsers page
            router.push("/intranet/allusers");
            
    
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    const GoBack = async () => {
        router.push("/intranet/allusers");
    }


    // Your loadDatabase function loads an SQLite database in a client-side JavaScript environment using SQL.js (a WebAssembly-based SQLite implementation). 
    // However, since SQL.js operates entirely in memory, it does not persist changes (like deletions) to a file-based database unless explicitly saved. 
    // This explains why deleted records reappear after a page refresh.
    const DeleteUserData = async (dataUser) => {
        console.log('DeleteUserData dataUser:', dataUser);
    
        if (!db) {
            console.error('Database is not initialized');
            return;
        }
    
        try {
            // Check if the user exists before deletion
            const checkUser = db.exec(`SELECT * FROM T_Utente WHERE Id = ${id}`);
            console.log('DeleteUserData - ' + `SELECT * FROM T_Utente WHERE Id = ${id}`);
    
            if (!checkUser || checkUser.length === 0) {
                console.warn("User not found. Nothing to delete.");
                return;
            } else {
                console.log("DeleteUserData - User exists before deletion:", checkUser);
            }
    
            // Delete the user
            db.run(`DELETE FROM T_Utente WHERE Id = ${id}`);
            console.log("User deleted successfully.");
    
            // Redirect to AllUsers page
            router.push("/intranet/allusers");
    
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };
    

    if (loading) {
        return <CircularProgress />; // Show a loading spinner while data is being fetched
    }

    return (
        <>
        {/* Breadcrumbs */}
        <Box sx={{ margin: '16px' } }>
            <DynamicBreadCrumbs className={styles.MarginTop} aria-label="breadcrumb" />
        </Box>
        <UserContainer>
            <Typography variant="h4">User Details with ID: {id}</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller 
                    name="nome"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.name}>
                            <InputLabel htmlFor="nome">Nome</InputLabel>
                            <Input {...field} id="nome" />
                            <FormHelperText>{errors.nome?.message}</FormHelperText>
                        </FormControl>
                    )}
                />
                <Controller
                    name="cognome"
                    control={control}
                    rules={{ required: 'Surname is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.cognome}>
                        <InputLabel htmlFor="cognome">Cognome</InputLabel>
                        <Input {...field} id="cognome" />
                        <FormHelperText>{errors.cognome?.message}</FormHelperText>
                        </FormControl>
                    )}
                />
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                        },
                    }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.email}>
                        <InputLabel htmlFor="email">Email</InputLabel>
                        <Input {...field} id="email" />
                        <FormHelperText>{errors.email?.message}</FormHelperText>
                        </FormControl>
                    )}
                />
                <Controller
                    name="phone"
                    control={control}
                    rules={{
                        required: 'Phone is required',
                        pattern: {
                        value: /^[0-9]+$/,
                        message: 'Enter a valid phone number',
                        },
                    }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.phone}>
                        <InputLabel htmlFor="phone">Phone</InputLabel>
                        <Input {...field} id="phone" />
                        <FormHelperText>{errors.phone?.message}</FormHelperText>
                        </FormControl>
                    )}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                    name="datadinascita"
                    control={control}
                    rules={{
                        required: 'Date of Birth is required',
                    }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.datadinascita}>
                        <DatePicker
                            label="Date of Birth"
                            value={field.value}
                            onChange={(newValue) => field.onChange(newValue)} // Update the form state
                            // OLD renderInput={(params) => <TextField {...params} />}
                            slots={{ textField: (props) => <TextField {...props} /> }}
                        />
                        <FormHelperText>{errors.datadinascita?.message}</FormHelperText>
                        </FormControl>
                    )}
                    />
                </LocalizationProvider>
                <Controller
                    name="tipoutente"
                    control={control}
                    rules={{
                    required: 'User Type is required',
                    }}
                    render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoutente}>
                        <Autocomplete
                        id="tipoutente"
                        options={listTipoUtente}
                        getOptionLabel={(option) => option?.TipoUtente || ''}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        value={field.value || null}
                        onChange={(event, newValue) => field.onChange(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Select a User Type" />
                        )}
                        />
                        <FormHelperText>{errors.tipoutente?.message}</FormHelperText>
                    </FormControl>
                    )}
                />
                <Button
                    type="submit"
                    variant="contained"
                    className={styles.BtnBackAllUsers}
                    sx={{ mt: 2 }}
                    onClick={GoBack}
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    name="update" // Unique name to identify the button
                    variant="contained"
                    className={styles.BtnUpdateUser}
                    sx={{ mt: 2 }}
                    disabled={!isFormValid()} // Button is disabled if the form is invalid
                >
                    Update User
                </Button>
                <Button
                    type="submit"
                    name="delete" // Unique name to identify the button
                    variant="contained"
                    className={styles.BtnDeleteUser}
                    sx={{ mt: 2 }}
                >
                    Delete
                </Button>
            </form>
        </UserContainer>
        </>
    );
}

export default UserDetails;