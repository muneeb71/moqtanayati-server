const userService = require("../services/seller.service");
const { bucket } = require("../../../config/firebase");

class UserController {
  async checkExisting(req, res) {
    try {
      const result = await userService.checkExisting(req.body);
      res.status(200).json({
        success: true,
        data: {
          isRegistered: result,
          message: result
            ? "Email or phone already exists"
            : "Email and Phone is unique",
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password, deviceToken } = req.body;
      console.log("devic token", deviceToken);
      const result = await userService.login(email, password, deviceToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      await userService.forgotPassword(req.body);
      res
        .status(200)
        .json({ success: true, message: "Reset instructions sent." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      await userService.verifyOtp(req.body);
      res.status(200).json({ success: true, message: "OTP verified." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      await userService.resetPassword(req.body);
      res
        .status(200)
        .json({ success: true, message: "Password reset successful." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStoreOfAUser(req, res) {
    try {
      const store = await userService.getStoreOfAUser(req.params.id);
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }
      res.status(200).json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStore(req, res) {
    try {
      const store = await userService.getStore(req.params.id);
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }
      res.status(200).json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async editStore(req, res) {
    console.log("========== EDIT STORE START ==========");

    try {
      const storeId = req.params.id;
      console.log("Store ID:", storeId);
      console.log("Request Params:", req.params);
      console.log("Request Body:", req.body);
      console.log("Request Files:", req.files);

      // ✅ Validate request
      if (
        (!req.files || Object.keys(req.files).length === 0) &&
        Object.keys(req.body).length === 0
      ) {
        console.log("No data or files provided in request.");
        return res.status(400).json({
          success: false,
          message: "No data or files provided for update.",
        });
      }

      let image;
      let backgroundImage;

      // ✅ Upload store image (if provided)
      if (req.files?.image && req.files.image.length > 0) {
        console.log("Uploading store image...");
        const imageFile = req.files.image[0];
        const imageName = `moqtanayati/${storeId}/store/image_${Date.now()}_${
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
        console.log("✅ Image uploaded:", image);
      } else {
        console.log("No image file provided in request.");
      }

      // ✅ Upload store backgroundImage (if provided)
      if (req.files?.backgroundImage && req.files.backgroundImage.length > 0) {
        console.log("Uploading background image...");
        const backgroundImageFile = req.files.backgroundImage[0];
        const backgroundImageName = `moqtanayati/${storeId}/store/background_image_${Date.now()}_${
          backgroundImageFile.originalname
        }`;
        const file = bucket.file(backgroundImageName);

        await file.save(backgroundImageFile.buffer, {
          contentType: backgroundImageFile.mimetype,
          resumable: false,
        });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        backgroundImage = url;
        console.log("✅ Background image uploaded:", backgroundImage);
      } else {
        console.log("No background image file provided in request.");
      }

      // ✅ Merge data
      const storeData = { ...req.body };
      if (image) storeData.image = image;
      if (backgroundImage) storeData.backgroundImage = backgroundImage;

      console.log("Constructed storeData object:", storeData);

      // ✅ Update in DB
      const result = await userService.editStore(storeId, storeData);
      console.log("Database update successful. Result:", result);

      console.log("========== EDIT STORE SUCCESS ==========");
      res
        .status(200)
        .json({ success: true, data: result.message, store: result.store });
    } catch (error) {
      console.error("========== EDIT STORE ERROR ==========");
      console.error(error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStoreCategories(req, res) {
    try {
      console.log("========== GET STORE CATEGORIES START ==========");
      const categories = await userService.getStoreCategories();
      console.log("========== GET STORE CATEGORIES SUCCESS ==========");
      console.log("Categories:", categories);
       res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error("========== GET STORE CATEGORIES ERROR ==========");
      console.error(error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
