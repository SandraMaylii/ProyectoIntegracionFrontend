// 📁 src/pages/PruebaDeteccion.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as holistic from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';

const PruebaDeteccion = () => {
    const videoRef = useRef(null);
    const [grabando, setGrabando] = useState(false);
    const [prediccion, setPrediccion] = useState('');
    const [confianza, setConfianza] = useState(0);
    const [palabraActual, setPalabraActual] = useState('CUANDO');
    const [resultado, setResultado] = useState(null);
    const frames = useRef([]);

    useEffect(() => {
        if (!videoRef.current) return;

        const detector = new holistic.Holistic({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        detector.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            refineFaceLandmarks: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        detector.onResults(onResults);

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await detector.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
        });

        camera.start();
    }, []);

    const onResults = (results) => {
        if (!grabando) return;

        const getKeypoints = (landmarks) =>
            landmarks ? landmarks.flatMap((kp) => [kp.x, kp.y]) : [];

        const pose = getKeypoints(results.poseLandmarks);
        const left = getKeypoints(results.leftHandLandmarks);
        const right = getKeypoints(results.rightHandLandmarks);

        const all = [...pose, ...left, ...right];
        if (all.length > 0) frames.current.push(all);
    };

    const startGrabacion = () => {
        frames.current = [];
        setResultado(null);
        setGrabando(true);
        setTimeout(() => {
            setGrabando(false);
            enviarPrediccion();
        }, 2000);
    };

    const enviarPrediccion = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keypoints: frames.current }),
            });

            const data = await res.json();
            setPrediccion(data.etiqueta);
            setConfianza(data.confidence);
            setResultado(data.etiqueta.toUpperCase() === palabraActual.toUpperCase());
        } catch (err) {
            console.error('❌ Error al predecir:', err);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Prueba de detección de señas</h2>
            <h3>Palabra actual: <span style={{ color: 'purple' }}>{palabraActual}</span></h3>

            <video ref={videoRef} style={{ width: 640, height: 480 }} autoPlay muted />
            <br />
            <button onClick={startGrabacion}>🎬 Grabar seña</button>

            {prediccion && (
                <div>
                    <h3>✅ Predicción: {prediccion}</h3>
                    <p>Confianza: {confianza}</p>
                    <h3 style={{ color: resultado ? 'green' : 'red' }}>
                        {resultado ? '✔ Seña correcta' : '✘ Seña incorrecta'}
                    </h3>
                </div>
            )}

            {frames.current.length > 0 && (
                <pre style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'scroll', background: '#f0f0f0', padding: '10px' }}>
                    {JSON.stringify(frames.current[frames.current.length - 1], null, 2)}
                </pre>
            )}
        </div>
    );
};

export default PruebaDeteccion;