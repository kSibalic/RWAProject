import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';

const SignUp = () => {

    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminInviteToken, setAdminInviteToken] = useState('');

    const [error, setError] = useState(null);

    const handleSignUp = async (e) => {
                e.preventDefault();

                if(!fullName) {
                    setError("Please enter your full name!");
                    return;
                }
    
                if(!validateEmail(email)) {
                    setError("Please enter a valid email address!");
                    return;
                }
    
                if(!password) {
                    setError("Please enter the password");
                    return;
                }
    
                setError("");
            };

    return (
        <AuthLayout>
            <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
            <h3 className="text-3xl font-semibold text-black">Create an Account</h3>
                <p className="text-s text-slate-700 mt-[5px] mb-6">
                    Join us <a className="text-primary">today</a> by entering your details below
                </p>

                <form onSubmit={handleSignUp}>
                    <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            value = {fullName}
                            onChange = {({ target }) => setFullName(target.value)}
                            label = "Full Name"
                            placeholder = "RWA"
                            type = "text"
                        />
                        
                        <Input
                            value = {email}
                            onChange = {({ target }) => setEmail(target.value)}
                            label = "Email Address"
                            placeholder = "rwa@etfos.hr"
                            type = "text"
                        />

                        <Input
                            value = {password}
                            onChange = {({ target }) => setPassword(target.value)}
                            label = "Password"
                            placeholder = "Minimum 8 Characters"
                            type = "password"
                        />

                        <Input
                            value = {password}
                            onChange = {({ target }) => setPassword(target.value)}
                            label = "Admin Invite Token"
                            placeholder = "6 Digit Code"
                            type = "text"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" className="btn-primary">SIGN UP</button>

                    <p className="text-[13px] text-slate-800 mt-3">
                        Already have an account?{" "}
                        <Link className="font-medium text-primary underline cursor-pointer" to="/login">Log In</Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SignUp;