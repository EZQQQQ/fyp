// frontend/src/components/Profile/ProfilePage.js

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, fetchUserData, updateProfile } from '../../features/userSlice';
import config from '../../config';
import UserBanner from '../../common/UserBanner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR_URL = `${config.S3_BASE_URL}/uploads/defaults/default-avatar-user.jpeg`;
const DEFAULT_BANNER_URL = `${config.S3_BASE_URL}/uploads/defaults/default-banner.jpeg`;

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isModalImageLoading, setIsModalImageLoading] = useState(true);
  const modalContentRef = useRef(null);
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // States for new profile photo and banner
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [previewProfilePhoto, setPreviewProfilePhoto] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (newProfilePhoto) {
      const objectUrl = URL.createObjectURL(newProfilePhoto);
      setPreviewProfilePhoto(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewProfilePhoto(null);
    }
  }, [newProfilePhoto]);

  useEffect(() => {
    if (newBanner) {
      const objectUrl = URL.createObjectURL(newBanner);
      setPreviewBanner(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewBanner(null);
    }
  }, [newBanner]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
      if (event.key === 'Tab' && isModalOpen) {
        const focusableElements = modalContentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
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
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsModalImageLoading(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
      <div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      ></div>
    </div>
  );

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p className="text-lg text-gray-500 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  const {
    name,
    role,
    profileBio,
    questionsCount,
    answersCount,
    commentsCount,
    communitiesCount,
    profilePicture,
    profileBanner
  } = user;

  // Handle saving updated profile data
  const handleSave = async () => {
    if (!newProfilePhoto && !newBanner) {
      toast.info("No changes to save.");
      return;
    }

    try {
      setSaving(true);
      const profileData = {
        profilePicture: newProfilePhoto,
        profileBanner: newBanner,
      };

      await dispatch(updateProfile(profileData)).unwrap();
      setSaving(false);
      toast.success("Profile updated successfully!");
      setNewProfilePhoto(null);
      setNewBanner(null);

      // Refetch user data to update UI
      dispatch(fetchUserData());
      navigate('/profile');
    } catch (error) {
      setSaving(false);
      toast.error("Failed to update profile.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Cover Section */}
        <div className="relative h-35 md:h-65">
          {/* If user has a profileBanner, use it, otherwise default */}
          <UserBanner
            user={user}
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
            fallbackBanner={DEFAULT_BANNER_URL}
          />

          {/* Change banner input */}
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary py-1 px-2 text-sm font-medium text-white hover:bg-opacity-90 xsm:px-4"
            >
              <input
                type="file"
                name="cover"
                id="cover"
                className="sr-only"
                accept="image/*"
                onChange={(e) => setNewBanner(e.target.files[0] || null)}
              />
              <span>
                {/* SVG for Edit Icon */}
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 12.3207 13.4874 12.8333C13.1592 13.3469 12.7141 13.569 12.25 13.569H1.75C1.28587 13.569 0.840752 13.3469 0.512563 12.8333C0.184375 12.3207 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.99992 5.83329C6.03342 5.83329 5.24992 6.61679 5.24992 7.58329C5.24992 8.54979 6.03342 9.33329 6.99992 9.33329C7.96642 9.33329 8.74992 8.54979 8.74992 7.58329C8.74992 6.61679 7.96642 5.83329 6.99992 5.83329ZM4.08325 7.58329C4.08325 5.97246 5.38909 4.66663 6.99992 4.66663C8.61075 4.66663 9.91659 5.97246 9.91659 7.58329C9.91659 9.19412 8.61075 10.5 6.99992 10.5C5.38909 10.5 4.08325 9.19412 4.08325 7.58329Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span>Edit</span>
            </label>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5 relative">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative w-full h-full rounded-full drop-shadow-2">
              <div
                className="relative w-full h-full rounded-full cursor-pointer"
                onClick={openModal}
                ref={triggerRef}
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') openModal(); }}
                aria-label="Open profile image in full screen"
              >
                {isImageLoading && <Spinner />}
                <img
                  src={profilePicture && profilePicture.trim() !== '' ? profilePicture : DEFAULT_AVATAR_URL}
                  alt={name}
                  className="rounded-full h-full w-full object-cover"
                  loading="lazy"
                  onLoad={() => setIsImageLoading(false)}
                />
                {/* Preview Selected Profile Photo */}
                {previewProfilePhoto && (
                  <img
                    src={previewProfilePhoto}
                    alt="Preview Profile"
                    className="absolute top-0 left-0 w-full h-full rounded-full object-cover opacity-75"
                  />
                )}
              </div>
              <label
                htmlFor="profile-photo"
                className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 12.3207 13.4874 12.8333C13.1592 13.3469 12.7141 13.569 12.25 13.569H1.75C1.28587 13.569 0.840752 13.3469 0.512563 12.8333C0.184375 12.3207 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                    fill=""
                  />
                </svg>
                <input
                  type="file"
                  name="profile-photo"
                  id="profile-photo"
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => setNewProfilePhoto(e.target.files[0] || null)}
                />
              </label>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {name}
            </h3>
            <p className="font-medium">
              {role === "professor" ? "Professor" : role === "admin" ? "Admin" : "Student"}
            </p>

            {/* Stats */}
            <div className="mx-auto mt-4.5 mb-5.5 grid max-w-125 grid-cols-4 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  {questionsCount}
                </span>
                <span className="text-sm">Questions</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  {answersCount}
                </span>
                <span className="text-sm">Answers</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  {commentsCount}
                </span>
                <span className="text-sm">Comments</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4">
                <span className="font-semibold text-black dark:text-white">
                  {communitiesCount}
                </span>
                <span className="text-sm">Communities</span>
              </div>
            </div>

            {/* About Me */}
            <div className="mx-auto max-w-180">
              <h4 className="font-semibold text-black dark:text-white">
                About Me
              </h4>
              <p className="mt-4.5">
                {profileBio && profileBio.trim() !== ''
                  ? profileBio
                  : 'No bio available.'}
              </p>
            </div>

            {/* Image Previews */}
            {(previewProfilePhoto || previewBanner) && (
              <div className="mt-4">
                <div className="flex space-x-4">
                  {previewProfilePhoto && (
                    <div className="relative w-24 h-24">
                      <img
                        src={previewProfilePhoto}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer" onClick={() => setNewProfilePhoto(null)}>
                        &times;
                      </span>
                    </div>
                  )}
                  {previewBanner && (
                    <div className="relative w-32 h-24">
                      <img
                        src={previewBanner}
                        alt="Banner Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer" onClick={() => setNewBanner(null)}>
                        &times;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save button only visible if there's unsaved changes */}
            {(newProfilePhoto || newBanner) && (
              <div className="mt-4">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
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
              src={profilePicture && profilePicture.trim() !== '' ? profilePicture : DEFAULT_AVATAR_URL}
              alt="Full Profile"
              className="max-w-full max-h-screen rounded-xl shadow-lg transition-transform duration-300 object-contain"
              loading="lazy"
              onLoad={() => setIsModalImageLoading(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;