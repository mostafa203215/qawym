const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
const mobileHamburger = document.querySelector(".mobile-hamburger");
const sidebarOverlay = document.querySelector(".sidebar-overlay");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("open");
  sidebarOverlay.style.display =
    sidebar.classList.contains("open") && window.innerWidth <= 768
      ? "block"
      : "none";
});

mobileHamburger.addEventListener("click", () => {
  sidebar.classList.add("open");
  sidebarOverlay.style.display = "block";
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.style.display = "none";
});

document.addEventListener("click", (e) => {
  const isMobile = window.innerWidth <= 768;
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    !mobileHamburger.contains(e.target) &&
    isMobile
  ) {
    sidebar.classList.remove("open");
    sidebarOverlay.style.display = "none";
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open");
    sidebarOverlay.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    window.location.href = "../login/login.html";
    return;
  }

  const accountForm = document.getElementById("accountForm");
  const profilePictureInput = document.getElementById("profilePicture");
  const profilePreview = document.getElementById("profilePreview");
  const profilePreviewContainer = document.getElementById(
    "profilePreviewContainer"
  );
  const uploadBtn = document.getElementById("uploadBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const logoutConfirmOverlay = document.getElementById("logoutConfirmOverlay");
  const deleteConfirmOverlay = document.getElementById("deleteConfirmOverlay");
  const closeDeleteModal = document.getElementById("closeDeleteModal");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelDeleteAccountBtn = document.getElementById(
    "cancelDeleteAccountBtn"
  );
  const confirmDeleteAccountBtn = document.getElementById(
    "confirmDeleteAccountBtn"
  );
  const confirmPasswordDelete = document.getElementById(
    "confirmPasswordDelete"
  );
  const fullNameInput = document.getElementById("fullName");
  const charCount = document.getElementById("charCount");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]"
  );

  fullNameInput.value = currentUser.fullName || "";
  document.getElementById("email").value = currentUser.email || "";

  updateCharCounter();

  const userIndex = registeredUsers.findIndex(
    (user) => user.email === currentUser.email
  );
  if (userIndex !== -1) {
    document.getElementById("currentPassword").value =
      registeredUsers[userIndex].password || "";
  }

  updateSidebarProfile();

  if (currentUser.profilePicture) {
    profilePreview.src = currentUser.profilePicture;
  }

  fullNameInput.addEventListener("input", updateCharCounter);

  uploadBtn.addEventListener("click", function () {
    profilePictureInput.click();
  });

  profilePreviewContainer.addEventListener("click", function (e) {
    e.stopPropagation();
    profilePictureInput.click();
  });

  profilePictureInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("حجم الصورة يجب أن يكون أقل من 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        showError("يرجى اختيار ملف صورة فقط");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        profilePreview.src = e.target.result;

        profilePreviewContainer.style.transform = "scale(1.1)";
        setTimeout(() => {
          profilePreviewContainer.style.transform = "scale(1)";
        }, 300);
      };
      reader.readAsDataURL(file);
    }
  });

  accountForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword =
      document.getElementById("confirmNewPassword").value;

    if (!fullName) {
      showError("الاسم الكامل مطلوب");
      return;
    }

    if (fullName.length > 45) {
      showError("الاسم الكامل يجب ألا يزيد عن 45 حرفاً");
      return;
    }

    if (newPassword || confirmNewPassword) {
      if (!currentPassword) {
        showError("يجب إدخال كلمة المرور الحالية لتغيير كلمة المرور");
        return;
      }

      const userIndex = registeredUsers.findIndex(
        (user) => user.email === currentUser.email
      );
      if (
        userIndex === -1 ||
        registeredUsers[userIndex].password !== currentPassword
      ) {
        showError("كلمة المرور الحالية غير صحيحة");
        return;
      }

      if (newPassword.length < 6) {
        showError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showError("كلمتا المرور الجديدة غير متطابقتين");
        return;
      }
    }

    showLoading();

    setTimeout(() => {
      updateUserData(fullName, newPassword);
      hideLoading();
    }, 1500);
  });

  logoutBtn.addEventListener("click", function () {
    logoutConfirmOverlay.style.display = "flex";
  });

  confirmLogoutBtn.addEventListener("click", function () {
    logoutConfirmOverlay.style.display = "none";
    showLoading();
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("currentUser");
      showSuccess("تم تسجيل الخروج بنجاح");
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 1000);
    }, 1000);
  });

  cancelLogoutBtn.addEventListener("click", function () {
    logoutConfirmOverlay.style.display = "none";
  });

  deleteAccountBtn.addEventListener("click", function () {
    deleteConfirmOverlay.style.display = "flex";
  });

  closeDeleteModal.addEventListener("click", function () {
    deleteConfirmOverlay.style.display = "none";
    confirmPasswordDelete.value = "";
  });

  cancelDeleteAccountBtn.addEventListener("click", function () {
    deleteConfirmOverlay.style.display = "none";
    confirmPasswordDelete.value = "";
  });

  confirmDeleteAccountBtn.addEventListener("click", function () {
    const password = confirmPasswordDelete.value.trim();

    if (!password) {
      showError("يجب إدخال كلمة المرور للتأكيد");
      return;
    }

    const userIndex = registeredUsers.findIndex(
      (user) => user.email === currentUser.email
    );
    if (userIndex === -1 || registeredUsers[userIndex].password !== password) {
      showError("كلمة المرور غير صحيحة");
      return;
    }

    showLoading();
    setTimeout(() => {
      deleteUserAccount();
      hideLoading();
    }, 1500);
  });

  logoutConfirmOverlay.addEventListener("click", function (e) {
    if (e.target === logoutConfirmOverlay) {
      logoutConfirmOverlay.style.display = "none";
    }
  });

  deleteConfirmOverlay.addEventListener("click", function (e) {
    if (e.target === deleteConfirmOverlay) {
      deleteConfirmOverlay.style.display = "none";
      confirmPasswordDelete.value = "";
    }
  });

  function updateCharCounter() {
    const count = fullNameInput.value.length;
    charCount.textContent = count;

    const counterElement = document.querySelector(".char-counter");
    counterElement.classList.remove("warning", "danger");

    if (count > 40) {
      counterElement.classList.add("danger");
    } else if (count > 35) {
      counterElement.classList.add("warning");
    }
  }

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
      max-width: 400px;
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

  function showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      max-width: 400px;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 300);
    }, 3000);
  }

  function updateUserData(fullName, newPassword) {
    const newProfilePicture = profilePreview.src;

    const userIndex = registeredUsers.findIndex(
      (user) => user.email === currentUser.email
    );

    if (userIndex !== -1) {
      registeredUsers[userIndex].fullName = fullName;
      registeredUsers[userIndex].profilePicture = newProfilePicture;

      if (newPassword) {
        registeredUsers[userIndex].password = newPassword;
        document.getElementById("currentPassword").value = newPassword;
      }

      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    }

    const updatedUser = {
      ...currentUser,
      fullName: fullName,
      profilePicture: newProfilePicture,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    updateSidebarProfile();

    showSuccess("تم حفظ التغييرات بنجاح!");

    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
  }

  function updateSidebarProfile() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const sidebarProfile = document.getElementById("sidebarProfile");
    const sidebarName = document.getElementById("sidebarName");

    if (sidebarProfile && currentUser.profilePicture) {
      sidebarProfile.src = currentUser.profilePicture;
    }

    if (sidebarName && currentUser.fullName) {
      sidebarName.textContent = currentUser.fullName;
    }
  }

  function deleteUserAccount() {
    const updatedUsers = registeredUsers.filter(
      (user) => user.email !== currentUser.email
    );
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    localStorage.removeItem("currentUser");
    localStorage.setItem("isLoggedIn", "false");

    deleteConfirmOverlay.style.display = "none";

    showSuccess("تم حذف حسابك بنجاح");
    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 1500);
  }

  function showLoading() {
    document.body.classList.add("loading");
  }

  function hideLoading() {
    document.body.classList.remove("loading");
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hidden");
    }
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      hideLoading();
    }, 800);
  });

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
