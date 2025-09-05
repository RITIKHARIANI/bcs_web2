// Test script for register API
const testRegister = async () => {
  const testUser = {
    name: "Test Professor",
    email: `test${Date.now()}@university.edu`, // Unique email
    password: "testpassword123"
  };

  try {
    console.log("Testing register API with:", { ...testUser, password: "***" });
    
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", data);
    
    if (response.ok) {
      console.log("✅ Registration API working correctly!");
      return data.user;
    } else {
      console.log("❌ Registration failed:", data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    return null;
  }
};

testRegister();
