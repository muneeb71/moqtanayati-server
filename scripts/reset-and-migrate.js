const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting database reset and migration process...");

try {
  // Step 1: Export existing data
  console.log("\n📤 Step 1: Exporting existing data...");
  execSync("node scripts/export-data.js", { stdio: "inherit" });
  console.log("✅ Data export completed");

  // Step 2: Reset database and apply migrations
  console.log("\n🔄 Step 2: Resetting database and applying migrations...");
  execSync("npx prisma migrate reset --force", { stdio: "inherit" });
  console.log("✅ Database reset and migrations applied");

  // Step 3: Import the exported data
  console.log("\n📥 Step 3: Importing data back...");
  execSync("node scripts/import-data.js", { stdio: "inherit" });
  console.log("✅ Data import completed");

  // Step 4: Generate Prisma client
  console.log("\n🔧 Step 4: Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated");

  console.log("\n🎉 Database reset and migration completed successfully!");
  console.log("\n📊 Summary:");
  console.log("   ✅ Existing data backed up");
  console.log("   ✅ Database reset with new schema");
  console.log("   ✅ All data restored");
  console.log("   ✅ Cascade deletes enabled");
  console.log("   ✅ Prisma client updated");

  console.log("\n🚀 You can now start your server with: npm run dev");
} catch (error) {
  console.error("\n❌ Error during reset and migration:", error.message);
  console.log("\n🆘 If something went wrong:");
  console.log("   1. Check the data-export folder for your backed up data");
  console.log(
    "   2. You can manually restore data using: node scripts/import-data.js"
  );
  console.log("   3. Or start fresh with: node prisma/seed.js");
  process.exit(1);
}
