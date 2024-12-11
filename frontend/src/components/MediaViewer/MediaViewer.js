// frontend/src/components/MediaViewer/MediaViewer.js

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const MediaViewer = ({ file }) => {
    const filePath = file;
    const fileExtension = filePath.split('.').pop().toLowerCase();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isModalImageLoading, setIsModalImageLoading] = useState(true);
    const modalContentRef = useRef(null);
    const triggerRef = useRef(null);
    const closeButtonRef = useRef(null);

    const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'heic', 'heif'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'hevc'];

    const openModal = () => {
        if (imageExtensions.includes(fileExtension)) {
            setIsModalOpen(true);
            setIsModalImageLoading(true);
            document.body.style.overflow = 'hidden'; // Disable background scrolling
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto'; // Enable background scrolling
        if (triggerRef.current) {
            triggerRef.current.focus(); // Return focus to the trigger element
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isModalOpen) {
                closeModal();
            }
            if (event.key === 'Tab' && isModalOpen) {
                // Trap focus within the modal
                const focusableElements = modalContentRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        const handleClickOutside = (event) => {
            if (
                modalContentRef.current &&
                !modalContentRef.current.contains(event.target)
            ) {
                closeModal();
            }
        };

        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('mousedown', handleClickOutside);
            // Set focus to the close button when modal opens
            if (closeButtonRef.current) {
                closeButtonRef.current.focus();
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const Spinner = () => (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                aria-label="Loading"
            ></div>
        </div>
    );

    if (imageExtensions.includes(fileExtension)) {
        return (
            <>
                <div
                    className="relative w-full max-w-[605px] h-80 md:h-[540px] overflow-hidden rounded-xl cursor-pointer"
                    onClick={openModal}
                    ref={triggerRef}
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') openModal();
                    }}
                    aria-label="Open image in full screen"
                >
                    {/* Blurred Background - Visible on md and above */}
                    <div
                        className="absolute inset-0 bg-cover bg-center filter blur-2xl hidden md:block transition-opacity duration-300"
                        style={{ backgroundImage: `url(${filePath})` }}
                    ></div>
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black opacity-25"></div>
                    {/* Spinner */}
                    {isImageLoading && <Spinner />}
                    {/* Foreground Image */}
                    <img
                        src={filePath}
                        alt="Uploaded Media"
                        className="relative w-full h-full object-cover object-center"
                        loading="lazy"
                        onLoad={() => setIsImageLoading(false)}
                    />
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
                        aria-modal="true"
                        role="dialog"
                    >
                        <div
                            className="relative p-4 bg-transparent"
                            ref={modalContentRef}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-white text-3xl font-bold focus:outline-none transition transform hover:scale-110"
                                aria-label="Close"
                                ref={closeButtonRef}
                            >
                                &#x2715;
                            </button>
                            {/* Spinner in Modal */}
                            {isModalImageLoading && <Spinner />}
                            {/* Expanded Image */}
                            <img
                                src={filePath}
                                alt="Expanded Media"
                                className="max-w-full max-h-screen rounded-xl shadow-lg transition-transform duration-300 object-contain"
                                loading="lazy"
                                onLoad={() => setIsModalImageLoading(false)}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    } else if (videoExtensions.includes(fileExtension)) {
        return (
            <div className="relative w-full max-w-[605px] h-80 md:h-[540px] overflow-hidden rounded-xl bg-black">
                <video
                    controls
                    className="w-full h-full object-contain"
                    loading="lazy"
                >
                    <source src={filePath} type={`video/${fileExtension}`} />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    } else if (fileExtension === 'pdf') {
        return (
            <div className="relative w-full max-w-[605px] h-80 md:h-[540px] rounded-xl">
                <iframe
                    src={filePath}
                    title="PDF Viewer"
                    className="w-full h-full border-none rounded-xl"
                    loading="lazy"
                />
            </div>
        );
    } else {
        return <p>Unsupported file type.</p>;
    }
};

MediaViewer.propTypes = {
    file: PropTypes.string.isRequired,
};

export default MediaViewer;
