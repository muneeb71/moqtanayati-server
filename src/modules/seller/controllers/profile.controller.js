const profileService = require("../services/profile.service");

class ProfileController {
  async getProfile(req, res) {
    try {
      const profile = await profileService.getProfile(req.params.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.params.userId;
      let image;

      if (req.files?.avatar && req.files.avatar.length > 0) {
        console.log("Uploading profile image...");
        const imageFile = req.files.image[0];
        const imageName = `moqtanayati/${storeId}/profile/image_${Date.now()}_${
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
      const profile = await profileService.updateStatus(
        req.params.userId,
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
