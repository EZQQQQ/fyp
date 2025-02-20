// frontend/src/components/Header/DropdownNotification.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ClickOutside from "./ClickOutside";
import { markNotificationRead, markAllNotificationsRead } from "../../features/notificationSlice";

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Record the timestamp when the bell is clicked
  const [lastBellClickTime, setLastBellClickTime] = useState(null);
  const notifications = useSelector((state) => state.notification.notifications);
  const dispatch = useDispatch();

  // On mount, load the last bell click time from localStorage if available
  useEffect(() => {
    const storedTime = localStorage.getItem("lastBellClickTime");
    if (storedTime) {
      setLastBellClickTime(new Date(storedTime));
    }
  }, []);

  // When clicking the bell, mark all notifications as read, toggle the dropdown,
  // and persist the bell click timestamp in localStorage.
  const handleBellClick = () => {
    dispatch(markAllNotificationsRead());
    const now = new Date();
    setLastBellClickTime(now);
    localStorage.setItem("lastBellClickTime", now.toISOString());
    setDropdownOpen(!dropdownOpen);
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  // Only show the red dot if there are unread notifications that are newer than lastBellClickTime.
  const hasNewNotifications = notifications?.some((n) => {
    if (!lastBellClickTime) return !n.isRead;
    return !n.isRead && new Date(n.createdAt) > lastBellClickTime;
  });

  // Limit displayed notifications to 4
  const displayedNotifications = notifications.slice(0, 4);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={handleBellClick}
          to="#"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          {/* Only show red dot if there are NEW unread notifications */}
          {hasNewNotifications && (
            <span className="absolute -top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-red-500" />
          )}
          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
              fill=""
            />
          </svg>
        </Link>

        {dropdownOpen && (
          <div className="absolute -right-6 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
            <div className="px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">Notifications</h5>
            </div>
            <ul className="flex h-auto flex-col overflow-y-auto">
              {displayedNotifications &&
                displayedNotifications.map((notification) => {
                  // Extract questionId (if it is an object, extract id or _id)
                  const rawQuestionId = notification.questionId;
                  const extractedQuestionId =
                    (rawQuestionId && rawQuestionId.id) ||
                    (rawQuestionId && rawQuestionId._id) ||
                    rawQuestionId;
                  const questionUrl = extractedQuestionId
                    ? `/question/${extractedQuestionId.toString()}`
                    : "#";

                  return (
                    <li key={notification._id} className="border-t border-stroke">
                      <Link
                        onClick={() => handleMarkRead(notification._id)}
                        to={questionUrl}
                        className="flex gap-3 px-4.5 py-3 hover:bg-gray-2 dark:hover:bg-meta-4"
                      >
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {notification.sender && notification.sender.profilePicture ? (
                            <img
                              src={notification.sender.profilePicture}
                              alt={notification.sender.username}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-700">
                              {notification.sender && notification.sender.username
                                ? notification.sender.username.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}
                        </div>
                        {/* Notification Content */}
                        <div className="flex-1">
                          <p className="text-xs">
                            <strong>
                              {notification.sender && notification.sender.username
                                ? notification.sender.username
                                : "unknown user"}{" "}
                              replied to your{" "}
                              <strong>
                                {notification.type === "questionAnswer"
                                  ? "question"
                                  : notification.type === "questionComment"
                                    ? "question"
                                    : "answer"}
                              </strong>{" "}
                              in{" "}
                              <strong>
                                {notification.community && notification.community.name
                                  ? notification.community.name
                                  : "unknown community"}
                              </strong>
                            </strong>{" "}
                            • {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {notification.content}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              {notifications.length > 4 && (
                <li className="border-t border-stroke">
                  <Link
                    to="/notifications"
                    className="block text-center px-4.5 py-3 hover:bg-gray-2 dark:hover:bg-meta-4 text-xs"
                  >
                    View all notifications
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
