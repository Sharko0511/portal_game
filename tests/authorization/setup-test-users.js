require("dotenv").config({ path: "../../.env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function setup() {
  console.log("Creating test users...\n");

  // 1. Create admin user
  const { data: adminData, error: adminError } =
    await supabase.auth.admin.createUser({
      email: "admin@admin.com",
      password: "adminadmin",
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });

  if (adminError) {
    console.log("Admin creation error:", adminError.message);
  } else {
    console.log("Admin user created:", adminData.user.id);

    // Set admin role
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", adminData.user.id);

    if (roleError) {
      console.log("Admin role error:", roleError.message);
    } else {
      console.log("Admin role set to 'admin'");
    }
  }

  // 2. Create regular user
  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email: "user@user.com",
      password: "useruser",
      email_confirm: true,
      user_metadata: { display_name: "User" },
    });

  if (userError) {
    console.log("User creation error:", userError.message);
  } else {
    console.log("User created:", userData.user.id);
  }

  // 3. Verify
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, is_banned");

  console.log("\nAll profiles:");
  console.table(profiles);
}

setup().catch(console.error);
