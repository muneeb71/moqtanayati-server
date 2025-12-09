const profileService = require("../services/profile.service");
const { bucket } = require("../../../config/firebase");

class ProfileController {
  async getProfile(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }

      const authenticatedUserId = req.user.userId;
      const userRole = req.user.role;
      const requestedUserId = req.params.userId || authenticatedUserId;

      if (userRole !== "ADMIN" && requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false, 
          message: "You can only view your own profile" 
        });
      }

      const profile = await profileService.getProfile(requestedUserId, userRole === "ADMIN");
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }

      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.user.userId;

      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false, 
          message: "You can only modify your own profile" 
        });
      }

      const userId = authenticatedUserId;
      let image;

      if (req.files?.avatar && req.files.avatar.length > 0) {
        console.log("Uploading profile image...");
        const imageFile = req.files.avatar[0];
        const imageName = `moqtanayati/${userId}/profile/image_${Date.now()}_${
          imageFile.originalname
        }`;
        const file = bucket.file(imageName);

        await file.save(imageFile.buffer, {
          contentType: imageFile.mimetype,
          resumable: false,
        });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        image = url;
        console.log("Image uploaded:", image);
      } else {
        console.log("No image file provided in request.");
      }

      // Merge data
      const data = { ...req.body };
      if (image) data.avatar = image;

      const profile = await profileService.updateProfile(userId, data);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }

      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.user.userId;
      const userRole = req.user.role;

      if (userRole !== "ADMIN" && requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false, 
          message: "You can only update your own account status" 
        });
      }

      const profile = await profileService.updateStatus(
        requestedUserId,
        req.body.status
      );
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const result = await profileService.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAuctionPreference(req, res) {
    try {
      const userId = req.user.userId;
      const result = await profileService.updateAuctionPreference(
        userId,
        req.body
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProfileController();
