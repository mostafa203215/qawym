document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const messageArea = document.getElementById("messageArea");

  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    hideMessage();
    clearFieldErrors();

    if (!validateEmail(email)) {
      showFieldError("email", "البريد الإلكتروني غير صحيح");
      return;
    }

    if (password.length < 6) {
      showFieldError("password", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    loadingOverlay.style.display = "flex";

    setTimeout(() => {
      simulateLogin(email, password, rememberMe);
    }, 2000);
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showMessage(message, type = "error") {
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
    messageArea.style.display = "block";

    setTimeout(() => {
      hideMessage();
    }, 5000);
  }

  function hideMessage() {
    messageArea.style.display = "none";
  }

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

  function clearFieldErrors() {
    document.querySelectorAll(".error-text").forEach((el) => el.remove());

    document.querySelectorAll(".form-group.error").forEach((el) => {
      el.classList.remove("error");
    });
  }

  function simulateLogin(email, password, rememberMe) {

    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const user = existingUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      if (rememberMe) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberMe", "true");
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      showMessage("تم تسجيل الدخول بنجاح! جاري التوجيه...", "success");

      setTimeout(() => {
        window.location.href = "../../qawim_ai/index.html";
      }, 1500);
    } else {
      loadingOverlay.style.display = "none";
      showMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  }

  if (localStorage.getItem("rememberMe") === "true") {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      document.getElementById("email").value = savedEmail;
      document.getElementById("rememberMe").checked = true;
    }
  }
});
