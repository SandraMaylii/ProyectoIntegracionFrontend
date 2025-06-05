import React, { useEffect } from 'react';
import '../styles/authForm.css';
import 'boxicons/css/boxicons.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const container = document.querySelector('.container');
        const registerBtn = document.querySelector('.register-btn');
        const loginBtn = document.querySelector('.login-btn');

        registerBtn.addEventListener('click', () => {
            container.classList.add('active');
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove('active');
        });
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const res = await axios.post('http://localhost:3001/api/register', {
                username,
                email,
                password
            });

            alert(res.data.message || 'Usuario registrado');
            localStorage.setItem('userEmail', email);
            form.reset();
            navigate('/aprendizaje-individual'); // ✅ Cambio aquí
        } catch (err) {
            alert('Error al registrar: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/login', {
                email,
                password
            });

            if (res.data.success) {
                alert('Inicio de sesión exitoso');
                localStorage.setItem('userEmail', email);
                form.reset();
                navigate('/aprendizaje-individual'); // ✅ Cambio aquí también
            } else {
                alert('Credenciales incorrectas');
            }
        } catch (err) {
            alert('Error al iniciar sesión: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container">
            <div className="form-box login">
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type="email" name="email" placeholder="Email" required />
                        <i className="bx bxs-user"></i>
                    </div>
                    <div className="input-box">
                        <input type="password" name="password" placeholder="Password" required />
                        <i className="bx bxs-lock-alt"></i>
                    </div>
                    <div className="forgot-link">
                        <a href="#">Forgot Password?</a>
                    </div>
                    <button type="submit" className="btn">Login</button>
                    
                    
                </form>
            </div>

            <div className="form-box register">
                <form onSubmit={handleRegister}>
                    <h1>Registration</h1>
                    <div className="input-box">
                        <input type="text" name="username" placeholder="Username" required />
                        <i className="bx bxs-user"></i>
                    </div>
                    <div className="input-box">
                        <input type="email" name="email" placeholder="Email" required />
                        <i className="bx bxs-envelope"></i>
                    </div>
                    <div className="input-box">
                        <input type="password" name="password" placeholder="Password" required />
                        <i className="bx bxs-lock-alt"></i>
                    </div>
                    <button type="submit" className="btn">Register</button>
                    
                    
                </form>
            </div>

            <div className="toggle-box">
                <div className="toggle-panel toggle-left">
                    <h1>Hello, Welcome!</h1>
                    <p>Don't have an account?</p>
                    <button className="btn register-btn">Register</button>
                </div>

                <div className="toggle-panel toggle-right">
                    <h1>Welcome Back!</h1>
                    <p>Already have an account?</p>
                    <button className="btn login-btn">Login</button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
