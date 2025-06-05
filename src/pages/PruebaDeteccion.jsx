import React, { useEffect, useRef, useState } from 'react';

const PruebaDeteccion = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const frames = useRef([]);

    const [grabando, setGrabando] = useState(false);
    const [prediccion, setPrediccion] = useState('');
    const [confianza, setConfianza] = useState(0);
    const [resultado, setResultado] = useState(null);
    const [alerta, setAlerta] = useState('');
    const [palabraActual, setPalabraActual] = useState('CUANDO');

    useEffect(() => {
        if (!window.Hands || !window.Camera || !window.drawConnectors || !window.drawLandmarks) {
            console.error("❌ Falta Hands o Camera o drawUtils. Verifica los scripts en index.html.");
            return;
        }

        const hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        const canvasCtx = canvasRef.current.getContext("2d");

        hands.onResults((results) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, 640, 480);
            canvasCtx.drawImage(results.image, 0, 0, 640, 480);

            const handsDetected = results.multiHandLandmarks || [];
            if (handsDetected.length > 0) {
                console.log("✋ Manos detectadas:", handsDetected.length);

                for (const landmarks of handsDetected) {
                    window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
                    window.drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });
                }

                if (grabando) {
                    let keypoints = [];

                    keypoints.push(...handsDetected[0].flatMap(p => [p.x, p.y]));
                    if (handsDetected[1]) {
                        keypoints.push(...handsDetected[1].flatMap(p => [p.x, p.y]));
                    }

                    while (keypoints.length < 150) keypoints.push(0);
                    frames.current.push(keypoints.slice(0, 150));

                    console.log("📸 Frame guardado:", frames.current.length);
                }
            } else {
                console.log("❌ Ninguna mano detectada");
            }

            canvasCtx.restore();
        });

        const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
                await hands.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
        });

        camera.start();
    }, [grabando]);

    const startGrabacion = () => {
        frames.current = [];
        setGrabando(true);
        setPrediccion('');
        setConfianza(0);
        setResultado(null);
        setAlerta('');

        setTimeout(() => {
            setGrabando(false);

            const valido = frames.current.some(f => !f.every(v => v === 0));
            if (!valido) {
                setAlerta('⚠ No se detectaron manos útiles. Intenta de nuevo.');
                return;
            }

            enviarPrediccion();
        }, 2000);
    };

    const enviarPrediccion = async () => {
        while (frames.current.length < 25) {
            frames.current.push(new Array(150).fill(0));
        }
        if (frames.current.length > 25) {
            frames.current = frames.current.slice(0, 25);
        }

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
            console.error("❌ Error al enviar predicción:", err);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h2> Detección de Señas + Predicción</h2>
            <h3> Palabra objetivo: <span style={{ color: 'purple' }}>{palabraActual}</span></h3>

            <canvas ref={canvasRef} width={640} height={480} style={{ border: '1px solid black' }} />
            <video ref={videoRef} style={{ display: 'none' }} />

            <br />
            <button onClick={startGrabacion} style={{ marginTop: '10px' }}>
                🎬 Grabar seña (2 segundos)
            </button>

            {alerta && <div style={{ color: 'orange', marginTop: '10px' }}>{alerta}</div>}

            {prediccion && (
                <div style={{ marginTop: '20px' }}>
                    <h3> Palabra detectada: <span style={{ color: 'blue' }}>{prediccion}</span></h3>
                    <p> Precisión: <strong>{(confianza * 100).toFixed(2)}%</strong></p>
                    <h3 style={{ color: resultado ? 'green' : 'red' }}>
                        {resultado ? '✔ Seña correcta' : '✘ Seña incorrecta'}
                    </h3>
                </div>
            )}

            {frames.current.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    textAlign: 'left',
                    maxHeight: '200px',
                    overflowY: 'scroll',
                    background: '#f0f0f0',
                    padding: '10px'
                }}>
                    <h4> Último frame capturado:</h4>
                    <pre>{JSON.stringify(frames.current[frames.current.length - 1], null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PruebaDeteccion;
