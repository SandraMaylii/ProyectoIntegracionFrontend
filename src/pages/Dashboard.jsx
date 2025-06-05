import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        aprendidas: 0,
        porAprender: 0,
        meta: 25
    });

    useEffect(() => {
        const email = localStorage.getItem('userEmail');

        fetch(`http://localhost:3001/api/user-data?email=${email}`)
            .then(res => res.json())
            .then(data => {
                const aprendidas = data.aprendidas.length;
                setUserData({
                    username: data.username,
                    aprendidas,
                    porAprender: 25 - aprendidas,
                    meta: 25
                });
            });
    }, []);

    return (
        <div className="perfil-container">
            <h2>Perfil</h2>
            <div className="perfil-box">
                <div className="perfil-left">
                    <img src="/avatar.svg" alt="Avatar" />
                    <p>@{userData.username}</p>
                    <button onClick={() => navigate('/aprendizaje')}>Mi aprendizaje</button>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}>Cerrar sesión</button>
                </div>
                <div className="perfil-right">
                    <div className="card"><h1>{userData.meta}</h1><p>Palabras - Meta</p></div>
                    <div className="card"><h1>{userData.aprendidas}</h1><p>Palabras - Aprendidas</p></div>
                    <div className="card"><h1>{userData.porAprender}</h1><p>Palabras - Por aprender</p></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
