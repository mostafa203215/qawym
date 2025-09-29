document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const profilePictureInput = document.getElementById("profilePicture");
  const profilePreview = document.getElementById("profilePreview");
  const profilePreviewContainer = document.getElementById(
    "profilePreviewContainer"
  );
  const uploadBtn = document.getElementById("uploadBtn");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // إظهار/إخفاء كلمة المرور
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  toggleConfirmPassword.addEventListener("click", function () {
    const type =
      confirmPasswordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  // رفع صورة البروفايل
  uploadBtn.addEventListener("click", function () {
    profilePictureInput.click();
  });

  profilePreviewContainer.addEventListener("click", function (e) {
    e.stopPropagation();
    profilePictureInput.click();
  });

  profilePreview.addEventListener("click", function (e) {
    e.stopPropagation();
    profilePictureInput.click();
  });

  profilePictureInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة يجب أن يكون أقل من 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("يرجى اختيار ملف صورة فقط");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        profilePreview.src = e.target.result;
        localStorage.setItem("tempProfilePicture", e.target.result);

        profilePreviewContainer.style.transform = "scale(1.1)";
        setTimeout(() => {
          profilePreviewContainer.style.transform = "scale(1)";
        }, 300);
      };
      reader.readAsDataURL(file);
    }
  });

  // السحب والإفلات للصور
  profilePreviewContainer.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.borderColor = "#2ba8d9";
    this.style.backgroundColor = "rgba(43, 168, 217, 0.1)";
  });

  profilePreviewContainer.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1532581";
    this.style.backgroundColor = "transparent";
  });

  profilePreviewContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.borderColor = "#d1532581";
    this.style.backgroundColor = "transparent";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      profilePictureInput.files = files;
      profilePictureInput.dispatchEvent(new Event("change"));
    }
  });

  // عند التسجيل
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validateEmail(email)) {
      showError("البريد الإلكتروني غير صحيح");
      return;
    }

    if (password.length < 6) {
      showError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      showError("كلمتا المرور غير متطابقتين");
      return;
    }

    loadingOverlay.style.display = "flex";

    setTimeout(() => {
      createAccount(fullName, email, password);
    }, 1000);
  });

  // التحقق من الإيميل
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // إظهار رسالة خطأ
  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 300);
    }, 3000);
  }

  // إنشاء الحساب بالـ API
  function createAccount(fullName, email, password) {
    let apiData = {
      username: fullName,
      password: password,
      email: email,
    };

    console.log("🚀 البيانات المرسلة للسيرفر:", JSON.stringify(apiData));

    fetch("https://mohamed50mostafa.pythonanywhere.com/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error("خطأ في الاستجابة: " + text);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ تم التسجيل:", data);

        localStorage.setItem("authToken", data.token || "");
        localStorage.setItem("currentUser", JSON.stringify(data.user || {}));

        window.location.href = "../../qawim_ai/index.html";
      })
      .catch((error) => {
        console.error("❌ خطأ أثناء إنشاء الحساب:", error);
        alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
      });
  }

  // استرجاع صورة البروفايل لو متخزنة مؤقتًا
  const tempProfilePicture = localStorage.getItem("tempProfilePicture");
  if (tempProfilePicture) {
    profilePreview.src = tempProfilePicture;
  }

  // أنيميشن للرسائل
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});
