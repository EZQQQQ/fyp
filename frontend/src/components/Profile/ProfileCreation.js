// frontend/src/components/Profile/ProfileCreation.js
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUserProfile } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BrushIcon from "@mui/icons-material/Brush";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import StarIcon from "@mui/icons-material/Star";

function ProfileCreation() {
  const [username, setUsername] = useState("");
  const [hasEditedUsername, setHasEditedUsername] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);
  const [profileBannerPreview, setProfileBannerPreview] = useState(null);
  const [profileBio, setProfileBio] = useState("");
  const [formFocus, setFormFocus] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.user);
  const backgroundRef = useRef(null);

  // Handle mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!backgroundRef.current) return;
      const { clientX, clientY } = e;
      const moveX = clientX - window.innerWidth / 2;
      const moveY = clientY - window.innerHeight / 2;
      setMousePosition({ x: moveX / 50, y: moveY / 50 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Set default username when user data is loaded
  useEffect(() => {
    if (user && user.defaultUsername && !hasEditedUsername) {
      setUsername(user.defaultUsername);
      console.log("Set default username:", user.defaultUsername);
    }
  }, [user, hasEditedUsername]);

  // Handle username changes with tracking
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setHasEditedUsername(true);
  };

  // Generate previews when files are selected
  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(profilePicture);
    }
  }, [profilePicture]);

  useEffect(() => {
    if (profileBanner) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileBannerPreview(reader.result);
      };
      reader.readAsDataURL(profileBanner);
    }
  }, [profileBanner]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    try {
      await dispatch(
        createUserProfile({ username, profilePicture, profileBanner, profileBio })
      ).unwrap();
      navigate("/"); // Redirect to home page after profile creation
    } catch (err) {
      console.error("Profile Creation Error:", err);
    }
  };

  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  // Generate particles for background
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 4 + 1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;

      particles.push(
        <div
          key={i}
          className="absolute rounded-full bg-white dark:bg-blue-400 opacity-30 dark:opacity-20"
          style={{
            width: size + 'px',
            height: size + 'px',
            left: left + '%',
            top: top + '%',
            animation: `float ${duration}s ${delay}s infinite ease-in-out`,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <>
      {/* Add inline keyframe animations */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-35px) translateX(-15px); }
          75% { transform: translateY(-20px) translateX(15px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="flex justify-center items-center min-h-screen overflow-hidden">
        {/* Enhanced dynamic background */}
        <div
          ref={backgroundRef}
          className="fixed inset-0 overflow-hidden z-0"
        >
          {/* Base gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950"></div>

          {/* Moving mesh pattern */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-20"
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M0 0h100v100H0z\" fill=\"none\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(0 0) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(25 0) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(50 0) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(75 0) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(0 25) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(25 25) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(50 25) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(75 25) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(0 50) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(25 50) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(50 50) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(75 50) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(0 75) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(25 75) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(50 75) scale(3)\"%3E%3C/path%3E%3Cpath d=\"M0 0h1v1H0z\" fill=\"%23000\" transform=\"translate(75 75) scale(3)\"%3E%3C/path%3E%3C/svg%3E')",
              backgroundSize: "80px 80px",
              transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`,
              transition: "transform 0.2s ease-out"
            }}
          ></div>

          {/* Animated gradient orbs */}
          <div
            className="absolute top-0 right-[10%] w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%)",
              transform: `translate(${mousePosition.y * -1}px, ${mousePosition.x}px) scale(${1 + Math.abs(mousePosition.x) / 5000})`,
              animation: "pulse 8s infinite",
              transition: "transform 0.5s ease-out"
            }}
          ></div>

          <div
            className="absolute bottom-[10%] left-[15%] w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0) 70%)",
              transform: `translate(${mousePosition.y}px, ${mousePosition.x * -1}px) scale(${1 + Math.abs(mousePosition.y) / 5000})`,
              animation: "pulse 12s 2s infinite",
              transition: "transform 0.6s ease-out"
            }}
          ></div>

          <div
            className="absolute top-[30%] left-[5%] w-[300px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(251, 113, 133, 0.3) 0%, rgba(251, 113, 133, 0) 70%)",
              transform: `translate(${mousePosition.x / 2}px, ${mousePosition.y / 2}px)`,
              animation: "pulse 10s 1s infinite",
              transition: "transform 0.7s ease-out"
            }}
          ></div>

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {renderParticles()}
          </div>

          {/* Subtle rotating gradient overlay */}
          <div
            className="absolute inset-0 opacity-30 dark:opacity-40"
            style={{
              background: "linear-gradient(45deg, transparent 40%, rgba(56, 189, 248, 0.1) 45%, rgba(56, 189, 248, 0) 50%, transparent 60%, rgba(139, 92, 246, 0.1) 65%, rgba(139, 92, 246, 0) 70%, transparent 80%)",
              backgroundSize: "200% 200%",
              animation: "rotate 60s linear infinite"
            }}
          ></div>

          {/* Wave effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden opacity-20">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-64">
              <path
                d="M0,0 C150,90 350,0 500,100 C650,190 750,110 900,150 C1050,190 1150,80 1200,100 L1200,280 L0,280 Z"
                className="fill-blue-400 dark:fill-blue-600"
                style={{ animation: "wave 15s ease-in-out infinite" }}
              ></path>
              <path
                d="M0,60 C150,30 350,120 500,60 C650,0 750,100 900,80 C1050,60 1150,30 1200,70 L1200,280 L0,280 Z"
                className="fill-indigo-400 dark:fill-indigo-600"
                style={{ animation: "wave 20s 2s ease-in-out infinite", opacity: 0.5 }}
              ></path>
            </svg>
          </div>
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10"
        >
          {/* Glass card effect */}
          <div className="overflow-hidden rounded-xl shadow-2xl backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-800/50 transition-all duration-300">
            {/* Dynamic banner with preview or default gradient */}
            <div className="relative h-36 md:h-48 overflow-hidden">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {profileBannerPreview ? (
                  <img src={profileBannerPreview} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-700">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </motion.div>

              {/* Animated banner decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: profileBannerPreview ? 0 : 0.7 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {!profileBannerPreview && (
                  <div className="text-white/70 flex flex-col items-center">
                    <BrushIcon style={{ fontSize: 30 }} />
                    <span className="mt-2 text-sm font-medium">Add a banner to personalize your profile</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Profile picture overlapping banner */}
            <div className="relative px-6">
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center cursor-pointer relative group"
                  onClick={() => document.getElementById('profile-picture-upload').click()}
                >
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                      <PersonIcon style={{ fontSize: 50 }} className="text-blue-400 dark:text-blue-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <CloudUploadIcon className="text-white text-opacity-0 group-hover:text-opacity-100 transition-all duration-300" />
                  </div>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange(setProfilePicture)}
                  />
                </motion.div>
              </div>
            </div>

            {/* Form content */}
            <div className="pt-20 px-6 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-1">
                  Complete Your Profile
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                  Let's personalize your experience before you start exploring
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-md overflow-hidden"
                  >
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleProfileSubmit} className="space-y-7">
                {/* Username field with animations */}
                <div className="relative">
                  <motion.div
                    animate={{
                      y: formFocus === 'username' ? -5 : 0,
                      opacity: formFocus === 'username' ? 0.9 : 1
                    }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <AccountCircleIcon fontSize="small" className={formFocus === 'username' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} />
                    <label htmlFor="username" className={`text-sm font-medium transition-colors ${formFocus === 'username' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      Username
                    </label>
                  </motion.div>

                  <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${formFocus === 'username' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'ring-1 ring-gray-200 dark:ring-gray-700'}`}>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={handleUsernameChange}
                      onFocus={() => setFormFocus('username')}
                      onBlur={() => setFormFocus(null)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                border-0 focus:ring-0 focus:outline-none transition-all duration-300"
                      placeholder="Choose a unique username"
                    />
                    <AnimatePresence>
                      {username && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircleIcon className="text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {user?.defaultUsername && !hasEditedUsername && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
                      >
                        <StarIcon fontSize="small" className="text-amber-500" />
                        Suggested based on your account
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* File uploads and bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Banner upload button */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <BrushIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Banner
                      </label>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label className="cursor-pointer block w-full">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange(setProfileBanner)}
                        />
                        <div className={`flex items-center justify-center py-3 px-4 rounded-lg
                                      ${profileBanner
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
                                      transition-all duration-300 group hover:bg-purple-50 dark:hover:bg-purple-900/20`}>
                          <CloudUploadIcon className={`mr-2 transition-colors ${profileBanner ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400'}`} />
                          <span className={`font-medium ${profileBanner ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300'}`}>
                            {profileBanner ? "Change Banner" : "Upload Banner"}
                          </span>
                        </div>
                      </label>
                    </motion.div>
                  </div>

                  {/* Bio field */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <EmojiEmotionsIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
                      <label htmlFor="profileBio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                    </div>

                    <div className="relative rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300">
                      <textarea
                        id="profileBio"
                        rows="4"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                  border-0 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-300 resize-none"
                        placeholder="Tell us about yourself..."
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Submit Button with animated background */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 px-6 rounded-xl overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.5),transparent_70%)] group-hover:bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.5),transparent_70%)] transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-white font-medium">Creating Profile...</span>
                      </>
                    ) : (
                      <span className="text-white font-medium">Create Profile</span>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default ProfileCreation;