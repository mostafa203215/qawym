document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const messageArea = document.getElementById("messageArea");
  const emailInput = document.getElementById("email");
  const rememberMeInput = document.getElementById("rememberMe");

  // 👁️‍🗨️ إظهار/إخفاء كلمة المرور
  togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    this.innerHTML = isPassword
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
  });

  // 📌 عند الضغط على تسجيل الدخول
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeInput.checked;

    hideMessage();
    clearFieldErrors();

    // ✅ التحقق من صحة البيانات
    if (!validateEmail(email)) {
      showFieldError("email", "البريد الإلكتروني غير صحيح");
      return;
    }

    if (password.length < 6) {
      showFieldError("password", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    // ⏳ عرض التحميل
    loadingOverlay.style.display = "flex";

    // 🚀 تسجيل الدخول عبر API
    loginWithAPI(email, password, rememberMe);
  });

  // 🎯 التحقق من البريد الإلكتروني
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 📢 عرض رسالة
  function showMessage(message, type = "error") {
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
    messageArea.style.display = "block";

    setTimeout(hideMessage, 5000);
  }

  // 📴 إخفاء الرسائل
  function hideMessage() {
    messageArea.style.display = "none";
  }

  // ❌ عرض خطأ عند الحقل
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest(".form-group");

    formGroup.classList.add("error");

    let errorElement = formGroup.querySelector(".error-text");
    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "error-text";
      formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;

    field.focus();
  }

  // 🧹 مسح الأخطاء
  function clearFieldErrors() {
    document.querySelectorAll(".error-text").forEach((el) => el.remove());
    document
      .querySelectorAll(".form-group.error")
      .forEach((el) => el.classList.remove("error"));
  }

  // 🔐 تسجيل الدخول باستخدام API
  async function loginWithAPI(email, password, rememberMe) {
    try {
      const response = await fetch(
        "https://mohamed50mostafa.pythonanywhere.com/dj-rest-auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.non_field_errors?.[0] ||
            data.detail ||
            "حدث خطأ أثناء تسجيل الدخول"
        );
      }

      // ✅ نجاح
      if (rememberMe) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("rememberMe");
      }

      // تخزين الـ Token أو بيانات المستخدم
      localStorage.setItem("token", data.key);
      localStorage.setItem("isLoggedIn", "true");

      showMessage("✅ تم تسجيل الدخول بنجاح! جاري التوجيه...", "success");

      setTimeout(() => {
        window.location.href = "../../qawim_ai/index.html";
      }, 1500);
    } catch (error) {
      loadingOverlay.style.display = "none";
      showMessage(error.message, "error");
    }
  }

  // 📌 تحميل البريد المحفوظ لو موجود
  if (localStorage.getItem("rememberMe") === "true") {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberMeInput.checked = true;
    }
  }
});
