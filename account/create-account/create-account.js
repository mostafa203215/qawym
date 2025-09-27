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

  // رفع صورة البروفايل - زر "اختر صورة"
  uploadBtn.addEventListener("click", function () {
    profilePictureInput.click();
  });

  // رفع صورة البروفايل - عند النقر على الصورة نفسها
  profilePreviewContainer.addEventListener("click", function (e) {
    // منع الحدث من الانتقال إلى العناصر الفرعية
    e.stopPropagation();
    profilePictureInput.click();
  });

  // منع فتح الملف مرتين إذا نقر المستخدم على الصورة داخل الحاوية
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

      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        alert("يرجى اختيار ملف صورة فقط");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        profilePreview.src = e.target.result;
        localStorage.setItem("tempProfilePicture", e.target.result);

        // إضافة تأثير عند تغيير الصورة
        profilePreviewContainer.style.transform = "scale(1.1)";
        setTimeout(() => {
          profilePreviewContainer.style.transform = "scale(1)";
        }, 300);
      };
      reader.readAsDataURL(file);
    }
  });

  // إضافة تأثير عند السحب والإفلات (اختياري)
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

  // معالجة إنشاء الحساب
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // التحقق من صحة البيانات
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

    // (تم إزالة التحقق من الشروط لأنها معلمة افتراضياً)
    // if (!agreeTerms) {
    //   showError("يجب الموافقة على الشروط والأحكام");
    //   return;
    // }

    // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    if (existingUsers.find((user) => user.email === email)) {
      showError("هذا البريد الإلكتروني مسجل بالفعل");
      return;
    }

    // عرض شاشة التحميل
    loadingOverlay.style.display = "flex";

    // محاكاة عملية إنشاء الحساب
    setTimeout(() => {
      createAccount(fullName, email, password);
    }, 2000);
  });

  // وظائف المساعدة
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(message) {
    // إنشاء نافذة تنبيه مخصصة بدلاً من alert العادي
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

  function createAccount(fullName, email, password) {
    // إنشاء صورة افتراضية إذا لم يتم رفع صورة
    let profilePicture = localStorage.getItem("tempProfilePicture");

    if (!profilePicture) {
      profilePicture = createDefaultAvatar(fullName);
    }

    // حفظ بيانات المستخدم في localStorage
    const userData = {
      fullName: fullName,
      email: email,
      profilePicture: profilePicture,
      createdAt: new Date().toISOString(),
    };

    // حفظ المستخدم الجديد في قائمة المستخدمين المسجلين
    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    existingUsers.push({ ...userData, password: password });
    localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

    // حفظ بيانات المستخدم الحالي
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");

    // مسح الصورة المؤقتة
    localStorage.removeItem("tempProfilePicture");

    // توجيه إلى الصفحة الرئيسية
    window.location.href = "../../qawim_ai/index.html";
  }

  // دالة إنشاء صورة افتراضية
  function createDefaultAvatar(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    // خلفية عشوائية
    const colors = ["#2ba8d9", "#d15425", "#ec6f50", "#2a93b0", "#c15516"];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];

    // رسم خلفية دائرية
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.fill();

    // إعداد النص
    ctx.fillStyle = "#FFFFFF";
    ctx.font = 'bold 70px "Tajawal", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // الحصول على الحروف الأولى من الاسم
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    // رسم الحروف في المركز
    ctx.fillText(initials, 100, 100);

    return canvas.toDataURL();
  }

  // تحميل الصورة المؤقتة إذا كانت موجودة
  const tempProfilePicture = localStorage.getItem("tempProfilePicture");
  if (tempProfilePicture) {
    profilePreview.src = tempProfilePicture;
  }

  // إضافة أنيميشن للإشعارات
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
