// frontend/src/components/Notification/NotificationsListener.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notificationAdded } from "../../features/notificationSlice";
import { selectUser } from "../../features/userSlice";

const NotificationsListener = ({ socket }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && socket) {
      // Register the user's socket connection
      socket.emit("register", user._id);
      // console.log(`User ${user._id} registered for notifications`);

      // Listen for new notifications
      socket.on("newNotification", (notification) => {
        console.log("Received new notification via socket:", notification);
        dispatch(notificationAdded(notification));
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off("newNotification");
      }
    };
  }, [user, socket, dispatch]);

  return null;
};

export default NotificationsListener;
