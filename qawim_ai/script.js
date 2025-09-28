// ======== سايدبار ديناميكي - إصلاح ========
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
const mobileHamburger = document.querySelector(".mobile-hamburger");

// إنشاء طبقة شفافة للسايدبار على الجوال
const sidebarOverlay = document.createElement("div");
sidebarOverlay.classList.add("sidebar-overlay");
document.querySelector(".container").appendChild(sidebarOverlay);

// فتح/إغلاق السايدبار عند الضغط على الهامبرجر في السايدبار
hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("open");
  sidebarOverlay.style.display =
    sidebar.classList.contains("open") && window.innerWidth <= 768
      ? "block"
      : "none";
});

// فتح/إغلاق السايدبار عند الضغط على الهامبرجر في الجوال
mobileHamburger.addEventListener("click", () => {
  sidebar.classList.add("open");
  sidebarOverlay.style.display = "block";
});

// إغلاق السايدبار عند النقر خارجًا (إذا كان مفتوحًا على الجوال)
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.style.display = "none";
});

// إغلاق السايدبار عند النقر خارجًا (إذا كان مفتوحًا على الجوال)
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

// إغلاق السايدبار عند تغيير حجم النافذة
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open");
    sidebarOverlay.style.display = "none";
  }
});

// ======== نظام إدارة المحادثات ========
class ConversationManager {
  constructor() {
    this.conversations = this.loadConversations();
    this.currentConversationId = null;
    this.currentSearchResults = null;
    this.currentSearchIndex = 0;
  }

  // توليد معرف فريد للمحادثة
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // تحميل المحادثات من localStorage
  loadConversations() {
    const stored = localStorage.getItem("chatConversations");
    return stored ? JSON.parse(stored) : [];
  }

  // حفظ المحادثات إلى localStorage
  saveConversations() {
    localStorage.setItem(
      "chatConversations",
      JSON.stringify(this.conversations)
    );
  }

  // إنشاء محادثة جديدة مع التحقق من الطول
  createConversation(name) {
    const trimmedName = name
      ? name.trim()
      : `محادثة ${this.conversations.length + 1}`;

    // التحقق من الطول
    if (trimmedName.length > 100) {
      throw new Error("اسم المحادثة لا يمكن أن يتجاوز 100 حرف");
    }

    const newConversation = {
      id: this.generateId(),
      name: trimmedName,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    this.conversations.unshift(newConversation);
    this.saveConversations();
    return newConversation.id;
  }

  // الحصول على محادثة بواسطة ID
  getConversation(id) {
    return this.conversations.find((conv) => conv.id === id);
  }

  // تحديث محادثة
  updateConversation(id, updates) {
    const index = this.conversations.findIndex((conv) => conv.id === id);
    if (index !== -1) {
      this.conversations[index] = { ...this.conversations[index], ...updates };
      this.saveConversations();
    }
  }

  // إضافة رسالة إلى محادثة
  addMessage(conversationId, message, sender) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      const newMessage = {
        text: message,
        sender: sender,
        timestamp: new Date().toISOString(),
        messageId: this.generateId(), // إضافة معرف فريد للرسالة
      };

      conversation.messages.push(newMessage);
      this.updateConversation(conversationId, {
        messages: conversation.messages,
      });

      return newMessage.messageId;
    }
    return null;
  }

  // تحديث رسالة موجودة
  updateMessage(conversationId, messageId, newText) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      const messageIndex = conversation.messages.findIndex(
        (msg) => msg.messageId === messageId
      );
      if (messageIndex !== -1) {
        conversation.messages[messageIndex].text = newText;
        conversation.messages[messageIndex].edited = true;
        conversation.messages[messageIndex].editTimestamp =
          new Date().toISOString();
        this.updateConversation(conversationId, {
          messages: conversation.messages,
        });
        return true;
      }
    }
    return false;
  }

  // حذف محادثة
  deleteConversation(id) {
    this.conversations = this.conversations.filter((conv) => conv.id !== id);
    this.saveConversations();

    // إذا كانت المحادثة المحذوفة هي الحالية، انتقل إلى محادثة جديدة
    if (this.currentConversationId === id) {
      this.switchToNewConversation();
    }
  }

  // تغيير اسم المحادثة مع التحقق من الطول
  renameConversation(id, newName) {
    const conversation = this.getConversation(id);
    if (conversation && newName.trim()) {
      const trimmedName = newName.trim();

      // التحقق من الطول
      if (trimmedName.length > 100) {
        throw new Error("اسم المحادثة لا يمكن أن يتجاوز 100 حرف");
      }

      conversation.name = trimmedName;
      this.updateConversation(id, { name: trimmedName });
      return true;
    }
    return false;
  }

  // البحث في المحادثات
  searchConversations(query) {
    if (!query.trim()) return this.conversations;

    const lowerQuery = query.toLowerCase();
    return this.conversations.filter(
      (conv) =>
        conv.name.toLowerCase().includes(lowerQuery) ||
        conv.messages.some((msg) => msg.text.toLowerCase().includes(lowerQuery))
    );
  }

  // البحث في محادثة محددة
  searchInConversation(conversationId, query) {
    const conversation = this.getConversation(conversationId);
    if (!conversation || !query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return conversation.messages.filter((msg) =>
      msg.text.toLowerCase().includes(lowerQuery)
    );
  }

  // التبديل إلى محادثة جديدة
  switchToNewConversation() {
    if (this.conversations.length > 0) {
      this.loadConversation(this.conversations[0].id);
    } else {
      this.currentConversationId = null;
      this.displayWelcomeMessage();
    }
  }

  // حذف الرسائل بعد رسالة معينة (لإعادة الإرسال)
  truncateMessagesAfter(conversationId, messageId) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      const messageIndex = conversation.messages.findIndex(
        (msg) => msg.messageId === messageId
      );
      if (messageIndex !== -1) {
        conversation.messages = conversation.messages.slice(
          0,
          messageIndex + 1
        );
        this.updateConversation(conversationId, {
          messages: conversation.messages,
        });
        return true;
      }
    }
    return false;
  }

  // دالة تحميل محادثة معينة مع إمكانية التمرير لرسالة محددة
  loadConversation(
    conversationId,
    scrollToMessageId = null,
    searchQuery = null
  ) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.currentConversationId = conversationId;

      // إخفاء رسالة الترحيب
      const welcome = document.querySelector(".welcome");
      if (welcome) welcome.style.display = "none";

      // مسح الرسائل الحالية
      messages.innerHTML = "";

      // عرض رسائل المحادثة مع إضافة الأزرار
      conversation.messages.forEach((msg) => {
        const messageElement = addMessage(msg.text, msg.sender, false);

        // تخزين معرف الرسالة
        messageElement.dataset.messageId = msg.messageId;

        // إضافة أزرار الرسالة
        addMessageActions(messageElement, msg.messageId);
      });

      // التمرير لرسالة محددة إذا تم توفيرها
      if (scrollToMessageId) {
        setTimeout(() => {
          const targetMessage = document.querySelector(
            `[data-message-id="${scrollToMessageId}"]`
          );
          if (targetMessage) {
            targetMessage.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            targetMessage.classList.add("search-result-message");

            // تظليل النص المطلوب إذا كان هناك استعلام بحث
            if (searchQuery) {
              highlightTextInMessage(targetMessage, searchQuery);
            }

            setTimeout(() => {
              targetMessage.classList.remove("search-result-message");
              if (searchQuery) {
                removeHighlightFromMessage(targetMessage);
              }
            }, 3000);
          }
        }, 100);
      }

      // إضافة فئة نشطة للمحادثة المحددة
      document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active");
      });

      const activeItem = document.querySelector(
        `[data-conversation-id="${conversationId}"]`
      );
      if (activeItem) {
        activeItem.classList.add("active");
      }

      // إغلاق السايدبار على الجوال بعد اختيار محادثة
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        sidebarOverlay.style.display = "none";
      }

      // التركيز على حقل الإدخال
      userInput.focus();
    }
  }

  // دالة عرض رسالة الترحيب
  displayWelcomeMessage() {
    this.currentConversationId = null;

    // إظهار رسالة الترحيب
    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.style.display = "flex";

    // مسح الرسائل
    messages.innerHTML = "";

    // إزالة الفئة النشطة من جميع المحادثات
    document.querySelectorAll(".conversation-item").forEach((item) => {
      item.classList.remove("active");
    });
  }
}

// إنشاء مدير المحادثات
const conversationManager = new ConversationManager();

// ======== عناصر المحادثة ========
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.querySelector(".messages");
const conversationList = document.getElementById("conversationList");

let waitingBot = false;

// إعدادات API بناءً على الصورة
const API_CONFIG = {
  token: "test1", // Token المطلوب
  name: "test1", // Name المطلوب
  contentType: "application/json",
};

// ======== وظائف أزرار الرسائل ========

// دالة نسخ النص
function copyMessageText(messageElement) {
  const text = messageElement.textContent || messageElement.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // تأثير بصر للإشارة إلى النسخ
      messageElement.classList.add("message-copied");
      setTimeout(() => {
        messageElement.classList.remove("message-copied");
      }, 500);

      // إشعار صغير
      showCopyNotification("تم نسخ الرسالة");
    })
    .catch((err) => {
      console.error("فشل في نسخ النص: ", err);
      showCopyNotification("فشل في نسخ الرسالة");
    });
}

function showCopyNotification(message) {
  const existingNotification = document.querySelector(".copy-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = "copy-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2ba8d9;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 2000);
}

// دالة تعديل الرسالة
function editMessage(messageElement) {
  const currentText = messageElement.textContent || messageElement.innerText;
  const messageId = messageElement.dataset.messageId;

  // إنشاء حقل نص للتعديل
  const input = document.createElement("textarea");
  input.value = currentText;
  input.style.cssText = `
    width: 100%;
    min-height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #ec6f50;
    border-radius: 10px;
    color: white;
    padding: 10px;
    font-size: 14px;
    resize: vertical;
  `;

  // استبدال محتوى الرسالة بحقل النص
  messageElement.textContent = "";
  messageElement.appendChild(input);
  input.focus();

  // إضافة أزرار الحفظ والإلغاء
  const editActions = document.createElement("div");
  editActions.style.cssText = `
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: flex-end;
  `;

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "حفظ وإرسال";
  saveBtn.style.cssText = `
    background: #4CAF50;
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
  `;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "إلغاء";
  cancelBtn.style.cssText = `
    background: #f44336;
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
  `;

  saveBtn.onclick = async () => {
    const newText = input.value.trim();
    if (newText) {
      // تحديث الرسالة في التخزين المحلي
      conversationManager.updateMessage(
        conversationManager.currentConversationId,
        messageId,
        newText
      );

      // حذف جميع الرسائل بعد هذه الرسالة
      conversationManager.truncateMessagesAfter(
        conversationManager.currentConversationId,
        messageId
      );

      // إعادة تحميل المحادثة لعرض التغييرات
      conversationManager.loadConversation(
        conversationManager.currentConversationId
      );

      // إرسال الرسالة المعدلة إلى الـAI
      await sendEditedMessage(newText);
    } else {
      messageElement.textContent = currentText;
      addMessageActions(messageElement, messageId);
    }
  };

  cancelBtn.onclick = () => {
    messageElement.textContent = currentText;
    addMessageActions(messageElement, messageId);
  };

  // إغلاق بالضغط على Escape
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      messageElement.textContent = currentText;
      addMessageActions(messageElement, messageId);
    } else if (e.key === "Enter" && e.ctrlKey) {
      saveBtn.click();
    }
  });

  editActions.appendChild(saveBtn);
  editActions.appendChild(cancelBtn);
  messageElement.appendChild(editActions);
}

// دالة إرسال الرسالة المعدلة إلى الـAI
async function sendEditedMessage(text) {
  if (waitingBot) return;

  waitingBot = true;
  sendBtn.disabled = true;

  try {
    // إرسال الطلب إلى API
    const response = await fetch(
      "https://mohamed50mostafa.pythonanywhere.com/api/",
      {
        method: "POST",
        headers: {
          "Content-Type": API_CONFIG.contentType,
          Authorization: `Token ${API_CONFIG.token}`,
          "Web-Antennisrate": "Token",
          Name: API_CONFIG.name,
        },
        body: JSON.stringify({
          message: text,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("خطأ في المصادقة: الرجاء التحقق من Token المصادقة");
      }
      throw new Error(`خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    const botReply =
      data.reply ||
      data.message ||
      data.response ||
      "تم استلام الرد من الخادم بنجاح";

    // إضافة رد البوت
    const botMessageId = conversationManager.addMessage(
      conversationManager.currentConversationId,
      botReply,
      "bot"
    );
    const botMessageElement = addMessage(botReply, "bot");
    botMessageElement.dataset.messageId = botMessageId;
    addMessageActions(botMessageElement, botMessageId);
  } catch (err) {
    console.error("Error details:", err);

    // رسائل خطأ أكثر وصفية
    if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
      const errorMsg =
        "⚠️ تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.";
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    } else if (err.message.includes("المصادقة")) {
      const errorMsg = "🔐 " + err.message;
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    } else {
      const errorMsg = "⚠️ " + err.message;
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    }
  } finally {
    waitingBot = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// دالة إضافة أزرار الرسالة
function addMessageActions(messageElement, messageId = null) {
  // إزالة الأزرار الحالية إذا كانت موجودة
  const existingActions = messageElement.querySelector(".message-actions");
  if (existingActions) {
    existingActions.remove();
  }

  // إنشاء أزرار جديدة
  const messageActions = document.createElement("div");
  messageActions.className = "message-actions";

  // زر النسخ
  const copyBtn = document.createElement("button");
  copyBtn.className = "message-action-btn copy-btn";
  copyBtn.innerHTML = '<i class="far fa-copy"></i>';
  copyBtn.title = "نسخ الرسالة";
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    copyMessageText(messageElement);
  };

  messageActions.appendChild(copyBtn);

  // زر التعديل (لرسائل المستخدم فقط)
  if (messageElement.classList.contains("user")) {
    const editBtn = document.createElement("button");
    editBtn.className = "message-action-btn edit-btn";
    editBtn.innerHTML = '<i class="far fa-edit"></i>';
    editBtn.title = "تعديل الرسالة";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editMessage(messageElement);
    };

    messageActions.appendChild(editBtn);
  }

  messageElement.appendChild(messageActions);
}

// ======== نافذة تأكيد الحذف المخصصة ========
function showDeleteConfirmation(conversationName, conversationId) {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.display = "flex";

  const popup = document.createElement("div");
  popup.classList.add("popup", "confirm-popup");

  popup.innerHTML = `
    <span class="close-modal">&times;</span>
    <h3>تأكيد الحذف</h3>
    <p>هل أنت متأكد أنك تريد حذف المحادثة "<strong>${conversationName}</strong>"؟</p>
    <p style="color: #ff6b6b; font-size: 12px;">هذا الإجراء لا يمكن التراجع عنه.</p>
    <div class="actions">
      <button id="confirmDeleteBtn">نعم، احذف</button>
      <button id="cancelDeleteBtn">إلغاء</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // التركيز على زر الإلغاء
  setTimeout(() => {
    document.getElementById("cancelDeleteBtn").focus();
  }, 100);

  // زر الإغلاق (X)
  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الإلغاء
  popup.querySelector("#cancelDeleteBtn").addEventListener("click", () => {
    overlay.remove();
  });

  // زر التأكيد
  popup.querySelector("#confirmDeleteBtn").addEventListener("click", () => {
    conversationManager.deleteConversation(conversationId);
    loadConversationsList();
    overlay.remove();
  });

  // الضغط برة البوب أب يقفل
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // إغلاق بالضغط على Escape
  document.addEventListener("keydown", function closeOnEscape(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeOnEscape);
    }
  });
}

// دالة تحميل وعرض المحادثات في الشريط الجانبي
function loadConversationsList(conversations = null) {
  conversationList.innerHTML = "";

  const conversationsToShow =
    conversations || conversationManager.conversations;

  if (conversationsToShow.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.classList.add("conversation-item", "empty-message");
    emptyMessage.innerHTML = `
      <span class="conversation-text">لا توجد محادثات</span>
    `;
    conversationList.appendChild(emptyMessage);
    return;
  }

  conversationsToShow.forEach((conversation) => {
    const listItem = document.createElement("li");
    listItem.classList.add("conversation-item");
    if (conversation.id === conversationManager.currentConversationId) {
      listItem.classList.add("active");
    }
    listItem.dataset.conversationId = conversation.id;

    listItem.innerHTML = `
      <i class="fas fa-comment conversation-icon"></i>
      <span class="conversation-text">${conversation.name}</span>
      <div class="conversation-actions">
        <button class="conversation-menu-btn">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <div class="conversation-menu">
          <button class="menu-item rename-btn">تغيير الاسم</button>
          <button class="menu-item delete-btn">حذف المحادثة</button>
        </div>
      </div>
    `;

    // حدث النقر لتحميل المحادثة
    listItem.addEventListener("click", (e) => {
      if (!e.target.closest(".conversation-actions")) {
        conversationManager.loadConversation(conversation.id);
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
          sidebarOverlay.style.display = "none";
        }
      }
    });

    // إدارة قائمة المحادثة (النقاط الثلاث)
    const menuBtn = listItem.querySelector(".conversation-menu-btn");
    const menu = listItem.querySelector(".conversation-menu");

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // إغلاق جميع القوائم المفتوحة الأخرى
      document.querySelectorAll(".conversation-menu").forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.classList.remove("active");
        }
      });

      menu.classList.toggle("active");
    });

    // حدث تغيير الاسم
    const renameBtn = listItem.querySelector(".rename-btn");
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("active");
      showRenameModal(conversation.id, conversation.name);
    });

    // حدث حذف المحادثة (باستخدام النافذة المخصصة)
    const deleteBtn = listItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("active");
      showDeleteConfirmation(conversation.name, conversation.id);
    });

    conversationList.appendChild(listItem);
  });

  // إغلاق القوائم عند النقر خارجها
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".conversation-menu") &&
      !e.target.closest(".conversation-menu-btn")
    ) {
      document.querySelectorAll(".conversation-menu").forEach((menu) => {
        menu.classList.remove("active");
      });
    }
  });
}

// دالة عرض نافذة تغيير الاسم
function showRenameModal(conversationId, currentName) {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.display = "flex";

  const popup = document.createElement("div");
  popup.classList.add("popup");

  popup.innerHTML = `
    <span class="close-modal">&times;</span>
    <h3>تغيير اسم المحادثة</h3>
    <input type="text" id="renameInput" value="${currentName}" placeholder="اكتب الاسم الجديد (حد أقصى 100 حرف)" maxlength="100">
    <div class="char-count" id="renameCount">${currentName.length}/100</div>
    <p class="char-limit-warning">الحد الأقصى لطول الاسم هو 100 حرف</p>
    <div class="actions">
      <button id="saveRenameBtn">حفظ</button>
      <button id="cancelRenameBtn">إلغاء</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // التركيز على حقل الإدخال
  const renameInput = document.getElementById("renameInput");
  const charCount = document.getElementById("renameCount");

  setTimeout(() => {
    renameInput.focus();
    renameInput.select();
  }, 100);

  // تحديث عداد الأحرف
  renameInput.addEventListener("input", (e) => {
    const length = e.target.value.length;
    charCount.textContent = `${length}/100`;

    if (length > 90) {
      charCount.classList.add("warning");
    } else {
      charCount.classList.remove("warning");
    }

    if (length >= 100) {
      charCount.classList.add("error");
    } else {
      charCount.classList.remove("error");
    }
  });

  // زر الإغلاق (X)
  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الإلغاء
  popup.querySelector("#cancelRenameBtn").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الحفظ
  popup.querySelector("#saveRenameBtn").addEventListener("click", () => {
    const newName = renameInput.value.trim();
    if (newName) {
      try {
        if (conversationManager.renameConversation(conversationId, newName)) {
          loadConversationsList();
          overlay.remove();
        }
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert("يرجى إدخال اسم للمحادثة");
    }
  });

  // الضغط برة البوب أب يقفل
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // إرسال بالضغط على Enter
  renameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      popup.querySelector("#saveRenameBtn").click();
    }
  });
}

// دالة إرسال الرسائل
async function sendMessage() {
  if (waitingBot) return;
  const text = userInput.value.trim();
  if (!text) return;

  // إذا لم تكن هناك محادثة نشطة، إنشاء واحدة جديدة
  if (!conversationManager.currentConversationId) {
    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.style.display = "none";

    const newId = conversationManager.createConversation(
      `محادثة ${conversationManager.conversations.length + 1}`
    );
    conversationManager.currentConversationId = newId;
    loadConversationsList();
  }

  // إضافة رسالة المستخدم
  const messageId = conversationManager.addMessage(
    conversationManager.currentConversationId,
    text,
    "user"
  );
  const messageElement = addMessage(text, "user");
  messageElement.dataset.messageId = messageId;
  addMessageActions(messageElement, messageId);

  userInput.value = "";

  waitingBot = true;
  sendBtn.disabled = true;

  try {
    // إرسال الطلب كـ JSON في body مع Headers المصادقة
    const response = await fetch(
      "https://mohamed50mostafa.pythonanywhere.com/api/",
      {
        method: "POST",
        headers: {
          "Content-Type": API_CONFIG.contentType,
          Authorization: `Token ${API_CONFIG.token}`,
          "Web-Antennisrate": "Token",
          Name: API_CONFIG.name,
        },
        body: JSON.stringify({
          message: text,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("خطأ في المصادقة: الرجاء التحقق من Token المصادقة");
      }
      throw new Error(`خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    const botReply =
      data.reply ||
      data.message ||
      data.response ||
      "تم استلام الرد من الخادم بنجاح";

    // إضافة رد البوت
    const botMessageId = conversationManager.addMessage(
      conversationManager.currentConversationId,
      botReply,
      "bot"
    );
    const botMessageElement = addMessage(botReply, "bot");
    botMessageElement.dataset.messageId = botMessageId;
    addMessageActions(botMessageElement, botMessageId);
  } catch (err) {
    console.error("Error details:", err);

    // رسائل خطأ أكثر وصفية
    if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
      const errorMsg =
        "⚠️ تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.";
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    } else if (err.message.includes("المصادقة")) {
      const errorMsg = "🔐 " + err.message;
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    } else {
      const errorMsg = "⚠️ " + err.message;
      const errorMessageId = conversationManager.addMessage(
        conversationManager.currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    }
  } finally {
    waitingBot = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// دالة إضافة الرسائل إلى الشاشة
function addMessage(text, sender, scroll = true) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  messages.appendChild(msg);

  if (scroll) {
    messages.scrollTop = messages.scrollHeight;
  }

  return msg;
}

// زر الإرسال
sendBtn.addEventListener("click", sendMessage);

// إرسال Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// ======== لودر عند التحميل ========
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loading");
  const preloader = document.querySelector(".preloader");

  // تحميل قائمة المحادثات فقط (بدون فتح أي محادثة تلقائياً)
  loadConversationsList();

  // عرض رسالة الترحيب فقط (لا نفتح أي محادثة تلقائياً)
  conversationManager.displayWelcomeMessage();

  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, 800);
  });
});

// ======== مودال إنشاء محادثة جديدة ========
const newChatBtn = document.querySelector(".new-chat-btn");

newChatBtn.addEventListener("click", () => {
  // إنشاء الخلفية
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.display = "flex";

  // إنشاء البوب أب
  const popup = document.createElement("div");
  popup.classList.add("popup");

  popup.innerHTML = `
    <span class="close-modal">&times;</span>
    <h3>سمي المحادثة</h3>
    <input type="text" id="chatNameInput" placeholder="اكتب الاسم (حد أقصى 100 حرف)" maxlength="100">
    <div class="char-count" id="chatNameCount">0/100</div>
    <p class="char-limit-warning">الحد الأقصى لطول الاسم هو 100 حرف</p>
    <div class="actions">
      <button id="saveChatBtn">إنشاء</button>
      <button id="cancelChatBtn">إلغاء</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // التركيز على حقل الإدخال
  const chatNameInput = document.getElementById("chatNameInput");
  const charCount = document.getElementById("chatNameCount");

  setTimeout(() => {
    chatNameInput.focus();
  }, 100);

  // تحديث عداد الأحرف
  chatNameInput.addEventListener("input", (e) => {
    const length = e.target.value.length;
    charCount.textContent = `${length}/100`;

    if (length > 90) {
      charCount.classList.add("warning");
    } else {
      charCount.classList.remove("warning");
    }

    if (length >= 100) {
      charCount.classList.add("error");
    } else {
      charCount.classList.remove("error");
    }
  });

  // زر الإغلاق (X)
  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الإلغاء
  popup.querySelector("#cancelChatBtn").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الحفظ
  popup.querySelector("#saveChatBtn").addEventListener("click", () => {
    const chatName = chatNameInput.value.trim();
    const name =
      chatName || `محادثة ${conversationManager.conversations.length + 1}`;

    try {
      // إنشاء محادثة جديدة
      const newId = conversationManager.createConversation(name);

      // تحميل قائمة المحادثات
      loadConversationsList();

      // تحميل المحادثة الجديدة
      conversationManager.loadConversation(newId);

      overlay.remove();

      // إغلاق السايدبار بعد إنشاء المحادثة (على الجوال)
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
          sidebarOverlay.style.display = "none";
        }
      }, 500);
    } catch (error) {
      alert(error.message);
    }
  });

  // الضغط برة البوب أب يقفل
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // إرسال بالضغط على Enter
  chatNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      popup.querySelector("#saveChatBtn").click();
    }
  });
});

// ======== وظيفة البحث عن المحادثات ========
const searchBtn = document.querySelector('.icon[data-text="بحث عن المحادثات"]');

searchBtn.addEventListener("click", () => {
  // إنشاء نافذة البحث
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.display = "flex";

  const popup = document.createElement("div");
  popup.classList.add("popup", "search-popup");
  popup.style.width = "400px";

  popup.innerHTML = `
    <span class="close-modal">&times;</span>
    <h3>بحث في المحادثات</h3>
    <div class="search-input-wrapper">
      <input type="text" id="searchInput" placeholder="اكتب كلمة للبحث...">
      <i class="fas fa-search"></i>
    </div>
    <div class="search-results" id="searchResults">
      <!-- سيتم ملؤها بالنتائج -->
    </div>
    <div class="actions">
      <button id="closeSearchBtn">إغلاق</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // التركيز على حقل البحث
  setTimeout(() => {
    document.getElementById("searchInput").focus();
  }, 100);

  // زر الإغلاق (X)
  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  // زر الإغلاق
  popup.querySelector("#closeSearchBtn").addEventListener("click", () => {
    overlay.remove();
  });

  // البحث أثناء الكتابة
  const searchInput = popup.querySelector("#searchInput");
  const searchResults = popup.querySelector("#searchResults");

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    performSearch(query, searchResults);
  });

  // الضغط برة البوب أب يقفل
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // إغلاق بالضغط على Escape
  document.addEventListener("keydown", function closeOnEscape(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeOnEscape);
    }
  });
});

// دالة تنفيذ البحث وعرض النتائج مع إمكانية التنقل للمكان المحدد
function performSearch(query, resultsContainer) {
  resultsContainer.innerHTML = "";

  if (!query) {
    resultsContainer.innerHTML =
      '<p class="no-results">اكتب كلمة للبحث في المحادثات</p>';
    return;
  }

  const results = conversationManager.searchConversations(query);

  if (results.length === 0) {
    resultsContainer.innerHTML =
      '<p class="no-results">لا توجد نتائج للبحث</p>';
    return;
  }

  results.forEach((conversation) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("search-result-item");

    // البحث عن جميع الرسائل المطابقة
    const matchingMessages = conversation.messages.filter((msg) =>
      msg.text.toLowerCase().includes(query.toLowerCase())
    );

    resultItem.innerHTML = `
      <div class="result-header">
        <i class="fas fa-comment"></i>
        <span class="result-title">${conversation.name}</span>
        <span class="result-count">(${matchingMessages.length} نتيجة)</span>
      </div>
      ${
        matchingMessages.length > 0
          ? `<div class="result-preview">${highlightText(
              matchingMessages[0].text,
              query
            )}</div>`
          : ""
      }
    `;

    resultItem.addEventListener("click", () => {
      // حفظ نتائج البحث للمحادثة الحالية
      conversationManager.currentSearchResults = matchingMessages;
      conversationManager.currentSearchIndex = 0;

      // تحميل المحادثة مع التمرير لأول نتيجة
      conversationManager.loadConversation(
        conversation.id,
        matchingMessages[0]?.messageId,
        query
      );

      // إظهار أدوات التنقل إذا كان هناك أكثر من نتيجة
      if (matchingMessages.length > 1) {
        showSearchNavigation(conversation.id, matchingMessages, 0, query);
      }

      document.querySelector(".overlay").remove();

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        sidebarOverlay.style.display = "none";
      }
    });

    resultsContainer.appendChild(resultItem);
  });
}

// دالة لتظليل النص المطابق في المعاينة
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// دالة للتمرير إلى رسالة محددة وتظليل النص المطلوب
function scrollToMessage(messageId, searchQuery) {
  const messageElement = document.querySelector(
    `[data-message-id="${messageId}"]`
  );

  if (messageElement) {
    // التمرير إلى الرسالة
    messageElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // إضافة تأثير تمييز مؤقت
    messageElement.classList.add("search-result-message");

    // تظليل النص المطلوب داخل الرسالة
    highlightTextInMessage(messageElement, searchQuery);

    // إزالة التمييز بعد فترة
    setTimeout(() => {
      messageElement.classList.remove("search-result-message");
      removeHighlightFromMessage(messageElement);
    }, 3000);
  }
}

// دالة لتظليل النص داخل الرسالة
function highlightTextInMessage(messageElement, query) {
  const text = messageElement.textContent;
  const regex = new RegExp(`(${query})`, "gi");
  const highlightedText = text.replace(
    regex,
    '<mark class="message-highlight">$1</mark>'
  );

  // حفظ النص الأصلي كخاصية مخصصة
  messageElement.dataset.originalText = text;

  // استبدال النص بالنص المظلل
  messageElement.innerHTML = highlightedText;

  // إعادة إضافة أزرار الرسالة
  const messageId = messageElement.dataset.messageId;
  addMessageActions(messageElement, messageId);
}

// دالة لإزالة التظليل من الرسالة
function removeHighlightFromMessage(messageElement) {
  const originalText = messageElement.dataset.originalText;
  if (originalText) {
    messageElement.textContent = originalText;

    // إعادة إضافة أزرار الرسالة
    const messageId = messageElement.dataset.messageId;
    addMessageActions(messageElement, messageId);
  }
}

// دالة لإظهار أدوات التنقل بين النتائج
function showSearchNavigation(
  conversationId,
  matchingMessages,
  currentIndex = 0,
  searchQuery = ""
) {
  // إزالة أدوات التنقل الحالية إذا كانت موجودة
  const existingNav = document.querySelector(".search-navigation");
  if (existingNav) {
    existingNav.remove();
  }

  if (matchingMessages.length <= 1) return;

  const nav = document.createElement("div");
  nav.className = "search-navigation";
  nav.innerHTML = `
    <div class="search-nav-content">
      <span class="search-nav-info">${currentIndex + 1} من ${
    matchingMessages.length
  }</span>
      <button class="search-nav-btn prev-btn" ${
        currentIndex === 0 ? "disabled" : ""
      }>
        <i class="fas fa-chevron-up"></i>
      </button>
      <button class="search-nav-btn next-btn" ${
        currentIndex === matchingMessages.length - 1 ? "disabled" : ""
      }>
        <i class="fas fa-chevron-down"></i>
      </button>
      <button class="search-nav-btn close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.querySelector(".chat-area").appendChild(nav);

  // أحداث الأزرار
  nav.querySelector(".prev-btn").addEventListener("click", () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollToMessage(matchingMessages[newIndex].messageId, searchQuery);
      showSearchNavigation(
        conversationId,
        matchingMessages,
        newIndex,
        searchQuery
      );
    }
  });

  nav.querySelector(".next-btn").addEventListener("click", () => {
    if (currentIndex < matchingMessages.length - 1) {
      const newIndex = currentIndex + 1;
      scrollToMessage(matchingMessages[newIndex].messageId, searchQuery);
      showSearchNavigation(
        conversationId,
        matchingMessages,
        newIndex,
        searchQuery
      );
    }
  });

  nav.querySelector(".close-btn").addEventListener("click", () => {
    nav.remove();
    // إزالة التظليل من جميع الرسائل
    document.querySelectorAll(".search-result-message").forEach((msg) => {
      msg.classList.remove("search-result-message");
      removeHighlightFromMessage(msg);
    });
  });
}

// اختبار الاتصال عند تحميل الصفحة
window.addEventListener("load", async () => {
  try {
    const response = await fetch(
      "https://mohamed50mostafa.pythonanywhere.com/api/",
      {
        method: "POST",
        headers: {
          "Content-Type": API_CONFIG.contentType,
          Authorization: `Token ${API_CONFIG.token}`,
          "Web-Antennisrate": "Token",
          Name: API_CONFIG.name,
        },
        body: JSON.stringify({ message: "connection_test" }),
      }
    );

    if (response.ok) {
      console.log("✅ API connection successful");
    } else {
      console.warn("❌ API connection failed:", response.status);
    }
  } catch (error) {
    console.error("❌ API test error:", error);
  }
});

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

// ==============================
// تحديث البروفايل عند تحميل الصفحة
function updateUserProfile() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const profileName = document.querySelector(".profile-name");
    const profileImage = document.querySelector(".profile img");

    if (profileName && userData.fullName) {
      profileName.textContent = userData.fullName;
    }

    if (profileImage) {
      if (userData.profilePicture) {
        profileImage.src = userData.profilePicture;

        // معالجة خطأ تحميل الصورة
        profileImage.onerror = function () {
          console.log("فشل تحميل صورة البروفايل، استخدام الصورة الافتراضية");
          this.src = createDefaultAvatar(userData.fullName || "U");
          this.onerror = null; // منع loop الأخطاء
        };
      } else {
        // إذا لم توجد صورة، إنشاء صورة افتراضية
        profileImage.src = createDefaultAvatar(userData.fullName || "U");
      }
    }

    // إخفاء زر التسجيل وإظهار خيار تسجيل الخروج
    const loginButton = document.querySelector('.icon[data-action="login"]');
    const logoutButton = document.querySelector('.icon[data-action="logout"]');

    if (loginButton) loginButton.style.display = "none";
    if (logoutButton) logoutButton.style.display = "flex";
  }
}

// دالة إنشاء صورة افتراضية
function createDefaultAvatar(name) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    // خلفية عشوائية من ألوان التطبيق
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
  } catch (error) {
    console.error("خطأ في إنشاء الصورة الافتراضية:", error);
    // استخدام صورة افتراضية بسيطة كبديل
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjMmJhOGQ5Ii8+PHRleHQgeD0iMTAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPs6/PC90ZXh0Pjwvc3ZnPg==";
  }
}

// تسجيل الخروج
function logout() {
  localStorage.setItem("isLoggedIn", "false");
  localStorage.removeItem("currentUser");
  window.location.href = "../account/login/login.html";
}

// التحقق من حالة التسجيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentPath = window.location.pathname;

  // قائمة الصفحات المسموح الوصول إليها بدون تسجيل دخول
  const allowedPages = [
    "/account/login/login.html",
    "/account/create-account/create-account.html",
    "/account/login/",
    "/account/create-account/",
  ];

  const isAllowedPage = allowedPages.some((page) => currentPath.includes(page));

  if (!isLoggedIn && !isAllowedPage) {
    window.location.href = "../account/login/login.html";
    return;
  }

  if (isLoggedIn) {
    updateUserProfile();
  }

  // إضافة حدث لتسجيل الخروج
  const logoutBtn = document.querySelector('.icon[data-action="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // تحديث البروفايل أيضاً عند حدث load للتأكد
  window.addEventListener("load", function () {
    if (isLoggedIn) {
      setTimeout(updateUserProfile, 100); // تأخير بسيط لضمان تحميل DOM
    }
  });
});

// أيضًا تحديث البروفايل عند تغيير حالة localStorage (للتحديثات بين Tabs)
window.addEventListener("storage", function (e) {
  if (e.key === "currentUser" || e.key === "isLoggedIn") {
    updateUserProfile();
  }
});
