document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // تبديل عرض كلمة المرور
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  // معالجة تسجيل الدخول
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // التحقق من صحة البيانات
    if (!validateEmail(email)) {
      showError("البريد الإلكتروني غير صحيح");
      return;
    }

    if (password.length < 6) {
      showError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    // عرض شاشة التحميل
    loadingOverlay.style.display = "flex";

    // محاكاة عملية تسجيل الدخول (استبدل هذا بالاتصال الحقيقي بالخادم)
    setTimeout(() => {
      simulateLogin(email, password, rememberMe);
    }, 2000);
  });

  // تسجيل الدخول عبر وسائل التواصل الاجتماعي
  document.querySelector(".google-btn").addEventListener("click", function () {
    alert("سيتم توجيهك إلى صفحة تسجيل الدخول عبر Google");
    // إضافة منطق تسجيل الدخول عبر Google هنا
  });

  document
    .querySelector(".facebook-btn")
    .addEventListener("click", function () {
      alert("سيتم توجيهك إلى صفحة تسجيل الدخول عبر Facebook");
      // إضافة منطق تسجيل الدخول عبر Facebook هنا
    });

  // وظائف المساعدة
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(message) {
    // يمكنك استبدال هذا بتنفيذ أفضل لعرض الأخطاء
    alert(message);
  }

  function simulateLogin(email, password, rememberMe) {
    // هذا محاكاة - استبدل بالاتصال الحقيقي بالخادم

    // التحقق من وجود المستخدم في localStorage (للمستخدمين المسجلين)
    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const user = existingUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // حفظ بيانات المستخدم إذا طلب "تذكرني"
      if (rememberMe) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberMe", "true");
      }

      // حفظ بيانات المستخدم الحالي
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      // توجيه إلى الصفحة الرئيسية
      window.location.href = "../../qawim_ai/index.html";
    } else {
      loadingOverlay.style.display = "none";
      showError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  }

  // تحميل البيانات المحفوظة إذا كان "تذكرني" مفعل
  if (localStorage.getItem("rememberMe") === "true") {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      document.getElementById("email").value = savedEmail;
      document.getElementById("rememberMe").checked = true;
    }
  }
});
