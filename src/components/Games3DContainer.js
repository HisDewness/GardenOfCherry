import React, { useEffect, useRef, useCallback, useState } from 'react';
import { animate, stagger } from 'animejs';
import '../Games3DContainer.css';

// Layout calculation functions
const calculateTableLayout = (games, containerWidth, containerHeight) => {
    const cardWidth = 120;
    const cardHeight = 160;
    const gap = 20;
    const columns = Math.max(4, Math.min(8, Math.floor(Math.sqrt(games.length * 1.5))));
    const rows = Math.ceil(games.length / columns);

    return games.map((game, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const totalWidth = columns * (cardWidth + gap) - gap;
        const totalHeight = rows * (cardHeight + gap) - gap;

        return {
            x: (col * (cardWidth + gap)) - (totalWidth / 2) + (cardWidth / 2),
            y: (row * (cardHeight + gap)) - (totalHeight / 2) + (cardHeight / 2),
            z: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
        };
    });
};

const calculateSphereLayout = (games) => {
    const radius = Math.max(400, games.length * 10);

    return games.map((game, i) => {
        const phi = Math.acos(-1 + (2 * i + 1) / games.length);
        const theta = Math.sqrt(games.length * Math.PI) * phi;

        return {
            x: radius * Math.cos(theta) * Math.sin(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(phi),
            rotateX: 0,
            rotateY: theta * (180 / Math.PI),
            rotateZ: 0,
        };
    });
};

const calculateHelixLayout = (games) => {
    const helixRadius = 200;
    const verticalSpacing = 30;

    return games.map((game, i) => {
        const theta = i * 0.6 + Math.PI; // Tighter spiral
        const y = -(i * verticalSpacing) + ((games.length * verticalSpacing) / 2);

        return {
            x: helixRadius * Math.sin(theta),
            y: y,
            z: helixRadius * Math.cos(theta),
            rotateX: 0,
            rotateY: (theta * 180 / Math.PI) + 90,
            rotateZ: 0,
        };
    });
};

const calculateGridLayout = (games) => {
    const gridSize = Math.ceil(Math.cbrt(games.length));
    const spacing = 180;

    return games.map((game, i) => {
        const x = (i % gridSize) - (gridSize - 1) / 2;
        const y = Math.floor((i / gridSize) % gridSize) - (gridSize - 1) / 2;
        const z = Math.floor(i / (gridSize * gridSize)) - (gridSize - 1) / 2;

        return {
            x: x * spacing,
            y: -y * spacing,
            z: z * spacing * 2,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
        };
    });
};

const getLayoutPositions = (layout, games, containerWidth, containerHeight) => {
    switch (layout) {
        case 'sphere':
            return calculateSphereLayout(games);
        case 'helix':
            return calculateHelixLayout(games);
        case 'grid':
            return calculateGridLayout(games);
        case 'table':
        default:
            return calculateTableLayout(games, containerWidth, containerHeight);
    }
};

const Games3DContainer = ({ games, currentLayout }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const elementsRef = useRef([]);
    const rotationRef = useRef({ x: 0, y: 0 });
    const autoRotateRef = useRef(null);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    // Auto-rotate animation
    const startAutoRotate = useCallback(() => {
        if (autoRotateRef.current) return;

        const rotateScene = () => {
            if (!sceneRef.current) return;
            rotationRef.current.y += 0.15;
            sceneRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
            autoRotateRef.current = requestAnimationFrame(rotateScene);
        };

        autoRotateRef.current = requestAnimationFrame(rotateScene);
        setIsAutoRotating(true);
    }, []);

    const stopAutoRotate = useCallback(() => {
        if (autoRotateRef.current) {
            cancelAnimationFrame(autoRotateRef.current);
            autoRotateRef.current = null;
        }
        setIsAutoRotating(false);
    }, []);

    // Mouse drag rotation
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isDragging = false;
        let previousX = 0;
        let previousY = 0;

        const onMouseDown = (e) => {
            isDragging = true;
            previousX = e.clientX;
            previousY = e.clientY;
            stopAutoRotate();
            container.style.cursor = 'grabbing';
        };

        const onMouseMove = (e) => {
            if (!isDragging || !sceneRef.current) return;

            const deltaX = e.clientX - previousX;
            const deltaY = e.clientY - previousY;

            rotationRef.current.y += deltaX * 0.3;
            rotationRef.current.x -= deltaY * 0.3;
            rotationRef.current.x = Math.max(-60, Math.min(60, rotationRef.current.x));

            sceneRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;

            previousX = e.clientX;
            previousY = e.clientY;
        };

        const onMouseUp = () => {
            isDragging = false;
            container.style.cursor = 'grab';
        };

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [stopAutoRotate]);

    // Start auto-rotate on mount
    useEffect(() => {
        startAutoRotate();
        return () => stopAutoRotate();
    }, [startAutoRotate, stopAutoRotate]);

    // Animate to new layout positions
    useEffect(() => {
        if (!containerRef.current || games.length === 0) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const positions = getLayoutPositions(currentLayout, games, containerWidth, containerHeight);

        // Animate each element to its new position
        elementsRef.current.forEach((el, i) => {
            if (!el || !positions[i]) return;

            const pos = positions[i];

            animate(el, {
                translateX: pos.x,
                translateY: pos.y,
                translateZ: pos.z,
                rotateX: pos.rotateX,
                rotateY: pos.rotateY,
                rotateZ: pos.rotateZ,
                duration: 1200,
                delay: stagger(30, { start: 0 })(el, i),
                ease: 'out(3)',
            });
        });
    }, [currentLayout, games]);

    const toggleAutoRotate = () => {
        if (isAutoRotating) {
            stopAutoRotate();
        } else {
            startAutoRotate();
        }
    };

    return (
        <div className="games-3d-wrapper">
            <div className="games-3d-container" ref={containerRef}>
                <div className="games-3d-scene" ref={sceneRef}>
                    {games.map((game, index) => (
                        <a
                            key={game.id}
                            ref={(el) => (elementsRef.current[index] = el)}
                            className="game-3d-element"
                            href={game.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={game.name}
                        >
                            <img src={game.image} alt={game.name} />
                            <div className="game-3d-name">{game.name}</div>
                        </a>
                    ))}
                </div>
            </div>

            <button
                className={`auto-rotate-toggle ${isAutoRotating ? 'active' : ''}`}
                onClick={toggleAutoRotate}
                title={isAutoRotating ? 'Pause rotation' : 'Resume rotation'}
            >
                {isAutoRotating ? '⏸' : '▶'}
            </button>

            <div className="games-3d-instructions">
                Click and drag to rotate • Scroll to explore
            </div>
        </div>
    );
};

export default Games3DContainer;
