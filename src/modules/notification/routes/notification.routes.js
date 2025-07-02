const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification.controller");

// Send + Save Notification
router.post("/send", NotificationController.send);

// Get all notifications
router.get("/", NotificationController.findAll);

// Get all notifications of a specific user
router.get("/user/:id", NotificationController.getUserNotifications);

// Get single notification by ID
router.get("/:id", NotificationController.findOne);

// Update a notification (mark as read, etc.)
router.patch("/:id", NotificationController.update);

// Delete a notification
router.delete("/:id", NotificationController.remove);

// Mark all notifications as read for a user
router.patch(
  "/mark-read/:userId",
  NotificationController.markNotificationsAsRead
);

module.exports = router;
