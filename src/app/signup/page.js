'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import Loader from '../_components/loader';
import { createUser, checkEmailExists, checkEmployeeIDExists, sendNotification, sendConfirmationEmail } from './_actions';
import { ToastContainer, toast } from 'react-toastify';
import LoaderButton from '../_components/loaderButton'
import { JobTitles, Departments, JobLevel } from '../../utils/jobConstants';
import { Location } from '../../utils/locationConstants';
import { generatePassword } from '../../utils/generatePassword';
import { ArrowLeft, User, Mail, MapPin, Briefcase, Users, Key, Send } from 'lucide-react';

export default function Signup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [emailChecking, setEmailChecking] = useState(false);
    const [employeeIdChecking, setEmployeeIdChecking] = useState(false);
    const [employeeIdError, setEmployeeIdError] = useState('');

    const allowedDomains = ["santehfeeds.com", "gmail.com"];

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedJobLevel, setSelectedJobLevel] = useState('');

    const handleJobTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            jobTitle: title,
        }));

        const job = JobTitles.find(j => j.value === title);
        if (job) {
            const jobLevel = JobLevel.find(jl => jl.id === job.jobLevelId)?.value || '';
            const departmentName = Departments.find(d => d.id === job.departmentId)?.value || '';

            setSelectedDepartment(departmentName);
            setSelectedJobLevel(jobLevel);
            setFormData(prev => ({
                ...prev,
                department: departmentName,
                jobLevel: jobLevel,
            }));
        }
    };

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        location: '',
        department: '',
        jobTitle: '',
        jobLevel: '',
        employeeid: ''
    });

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));

            if (value) {
                setEmailChecking(true);
                try {
                    const result = await checkEmailExists(value);
                    if (result.success) {
                        if (result.exists) {
                            setEmailError('This email is already registered');
                        } else {
                            setEmailError('');
                        }
                    }
                } catch (error) {
                    console.error('Email check error:', error);
                }
                setEmailChecking(false);
            } else {
                setEmailError('');
            }
        } else if (name === 'employeeid') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));

            if (value) {
                setEmployeeIdChecking(true);
                try {
                    const result = await checkEmployeeIDExists(value);
                    if (result.success) {
                        if (result.exists) {
                            setEmployeeIdError('This Employee ID is already registered');
                        } else {
                            setEmployeeIdError('');
                        }
                    }
                } catch (error) {
                    console.error('Employee ID check error:', error);
                }
                setEmployeeIdChecking(false);
            } else {
                setEmployeeIdError('');
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.email) {
                const emailCheckResult = await checkEmailExists(formData.email);
                if (emailCheckResult.success && emailCheckResult.exists) {
                    toast.error('This email is already registered!');
                    setLoading(false);
                    return;
                }

                const emailDomain = formData.email.split('@')[1];
                if (!allowedDomains.includes(emailDomain)) {
                    toast.error('Email domain is not allowed!');
                    setLoading(false);
                    return;
                }

                const employeeIdCheckResult = await checkEmployeeIDExists(formData.employeeid);
                if (employeeIdCheckResult.success && employeeIdCheckResult.exists) {
                    toast.error('This employee ID is already registered!');
                    setLoading(false);
                    return;
                }

                const autoPassword = generatePassword();
                const submitData = {
                    ...formData,
                    password: autoPassword,
                    jobTitle: formData.jobTitle,
                    department: selectedDepartment || formData.department,
                    jobLevel: formData.jobLevel || selectedJobLevel
                };

                const res = await createUser(submitData);
                if (res.success) {
                    await sendConfirmationEmail({
                        email: formData.email,
                        title: 'Account Created',
                        companyName: 'SANTEH FEEDS CORPORATION',
                        greeting: 'Good Day!',
                        name: formData.fullName,
                        body: 'Your account has been successfully created and is pending approval. You will be notified once it is approved.',
                        buttonText: 'View Dashboard',
                        buttonUrl: 'http://localhost:3000/login',
                        companyEmail: 'j.valencia@santehfeeds.com',
                        companyPhone: '+63 2 8584 4572'
                    });
                    await sendNotification(
                        'New Account Request',
                        `Account for approval ${formData.fullName}. Please review and approve the account.`,
                        formData.email,
                        formData.employeeid
                    );

                    toast.success(`Account request submitted! An email has been sent to ${formData.email}`);
                    setTimeout(() => {
                        router.push('/login');
                    }, 4500);
                } else {
                    toast.error(res.message);
                }
            }
        } catch (error) {
            toast.error('Error creating account. Please try again.');
        }
        setLoading(false);
    };

    const inputClasses = "mt-1 text-black block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50 transition-all duration-200 hover:border-gray-400";

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-700 via-green-500 via-teal-400 to-green-400 bg-[length:200%_200%] animate-[gradientMove_10s_ease_infinite] shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]">
            <Loader loading={loading} />
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
            />
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center">
                        <button
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-2 rounded-lg hover:bg-white/20"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-2xl sm:text-3xl font-bold text-black text-center flex-1">
                            Request Account
                        </h2>
                        <div className="w-6" />
                    </div>
                    <p className="text-blue-500 text-center text-sm mt-2">
                        Fill in your details and submit a request for approval
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label htmlFor="employeeid" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <User className="text-blue-500" />
                                Employee ID
                            </label>
                            <div className="relative">
                                <input
                                    id="employeeid"
                                    name="employeeid"
                                    type="text"
                                    value={formData.employeeid}
                                    onChange={handleChange}
                                    required
                                    className={`mt-1 text-black block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50 transition-all duration-200 hover:border-gray-400 ${employeeIdError ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your employee ID"
                                />
                                {employeeIdChecking && (
                                    <span className="absolute right-4 top-4 text-gray-500 text-sm font-medium">
                                        Checking...
                                    </span>
                                )}
                            </div>
                            {employeeIdError && (
                                <p className="mt-2 text-sm text-red-600 font-medium">{employeeIdError}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <User className="text-blue-500" />
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className={inputClasses}
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MapPin className="text-blue-500" />
                                Location
                            </label>
                            <select
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className={inputClasses + " appearance-none bg-white"}
                            >
                                <option value="">Select a location</option>
                                {Location.map((loc) => (
                                    <option key={loc.id} value={loc.value}>
                                        {loc.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="jobTitle" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Briefcase className="text-blue-500" />
                                Job Title
                            </label>
                            <input
                                id="jobTitle"
                                name="jobTitle"
                                type="text"
                                value={formData.jobTitle}
                                onChange={handleJobTitleChange}
                                required
                                list="job-title-suggestions"
                                className={inputClasses}
                                placeholder="Start typing to see suggestions..."
                            />
                            <datalist id="job-title-suggestions">
                                {JobTitles.map((job) => (
                                    <option key={job.id} value={job.value} />
                                ))}
                            </datalist>
                            <p className="mt-1 text-xs text-gray-500">
                                Select a suggestion or type your own title
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label htmlFor="department" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Users className="text-blue-500" />
                                Department
                            </label>
                            <input
                                id="department"
                                name="department"
                                type="text"
                                value={selectedDepartment || formData.department}
                                onChange={(e) => {
                                    setSelectedDepartment(e.target.value);
                                    setFormData(prev => ({ ...prev, department: e.target.value }));
                                }}
                                required
                                className={inputClasses}
                                placeholder="Department name"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="jobLevel" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Key className="text-blue-500" />
                                Job Level
                            </label>
                            <input
                                id="jobLevel"
                                name="jobLevel"
                                type="text"
                                value={formData.jobLevel || selectedJobLevel}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobLevel: e.target.value }))}
                                required
                                className={inputClasses}
                                placeholder="e.g., Regular, Senior, Manager"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Mail className="text-blue-500" />
                            Email
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`mt-1 text-black block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-50 transition-all duration-200 hover:border-gray-400 placeholder:text-gray-400 ${emailError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="you@example.com"
                            />
                            {emailChecking && (
                                <span className="absolute right-4 top-4 text-gray-500 text-sm font-medium">
                                    Checking...
                                </span>
                            )}
                        </div>
                        {emailError && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{emailError}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Allowed domains: santehfeeds.com, gmail.com
                        </p>
                    </div>

                    <div className="pt-2">
                        {loading ? (
                            <div className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600">
                                <LoaderButton loading={loading} />
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={emailError !== '' || employeeIdError !== ''}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 border-2 border-blue-500 rounded-xl shadow-sm text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <Send className="h-4 w-4" />
                                Submit Account Request
                            </button>
                        )}
                        <p className="mt-3 text-xs text-gray-600 font-medium text-center">
                            Account will be reviewed after signing up
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
