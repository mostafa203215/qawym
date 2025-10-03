// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
  const authToken = localStorage.getItem("authToken");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // إذا لم يكن المستخدم مسجلاً، قم بتوجيهه إلى صفحة إنشاء الحساب
  if (
    !authToken ||
    authToken === "YOUR_AUTH_TOKEN_HERE" ||
    isLoggedIn !== "true"
  ) {
    console.log("المستخدم غير مسجل، جاري التوجيه إلى صفحة إنشاء الحساب...");
    window.location.href = "../account/create-account/create-account.html";
    return false;
  }

  return true;
}

// تنفيذ التحقق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // التحقق من حالة تسجيل الدخول أولاً
  if (!checkLoginStatus()) {
    return; // لا تستمر في تنفيذ باقي الكود إذا لم يكن المستخدم مسجلاً
  }

  // باقي كود التهيئة للصفحة الرئيسية
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.querySelector(".hamburger");
  const mobileHamburger = document.querySelector(".mobile-hamburger");

  const sidebarOverlay = document.createElement("div");
  sidebarOverlay.classList.add("sidebar-overlay");
  document.querySelector(".container").appendChild(sidebarOverlay);

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

  // تحميل المحادثات وتهيئة الصفحة
  loadConversationsList();
  conversationManager.displayWelcomeMessage();

  // إخفاء التحميل بعد تحميل الصفحة
  window.addEventListener("load", () => {
    setTimeout(() => {
      const preloader = document.querySelector(".preloader");
      if (preloader) {
        preloader.classList.add("hidden");
      }
      document.body.classList.remove("loading");
    }, 800);
  });
});

class ConversationManager {
  constructor() {
    this.conversations = this.loadConversations();
    this.currentConversationId = null;
    this.currentSearchResults = null;
    this.currentSearchIndex = 0;
    this.serverChatIdMap = new Map();
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  loadConversations() {
    const stored = localStorage.getItem("chatConversations");
    return stored ? JSON.parse(stored) : [];
  }

  saveConversations() {
    localStorage.setItem(
      "chatConversations",
      JSON.stringify(this.conversations)
    );
  }

  createConversation(name, serverChatId = null) {
    const trimmedName = name
      ? name.trim()
      : `محادثة ${this.conversations.length + 1}`;

    if (trimmedName.length > 100) {
      throw new Error("اسم المحادثة لا يمكن أن يتجاوز 100 حرف");
    }

    const localId = this.generateId();
    const newConversation = {
      id: localId,
      name: trimmedName,
      messages: [],
      createdAt: new Date().toISOString(),
      serverChatId: serverChatId,
    };

    this.conversations.unshift(newConversation);
    this.saveConversations();

    if (serverChatId) {
      this.serverChatIdMap.set(localId, serverChatId);
    }

    return localId;
  }

  getConversation(id) {
    return this.conversations.find((conv) => conv.id === id);
  }

  getServerChatId(localId) {
    const conversation = this.getConversation(localId);
    return conversation?.serverChatId || null;
  }

  updateServerChatId(localId, serverChatId) {
    const conversation = this.getConversation(localId);
    if (conversation) {
      conversation.serverChatId = serverChatId;
      this.serverChatIdMap.set(localId, serverChatId);
      this.updateConversation(localId, { serverChatId: serverChatId });
      return true;
    }
    return false;
  }

  updateConversation(id, updates) {
    const index = this.conversations.findIndex((conv) => conv.id === id);
    if (index !== -1) {
      this.conversations[index] = { ...this.conversations[index], ...updates };
      this.saveConversations();
    }
  }

  addMessage(conversationId, message, sender) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      const newMessage = {
        text: message,
        sender: sender,
        timestamp: new Date().toISOString(),
        messageId: this.generateId(),
      };

      conversation.messages.push(newMessage);
      this.updateConversation(conversationId, {
        messages: conversation.messages,
      });

      return newMessage.messageId;
    }
    return null;
  }

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

  deleteConversation(id) {
    this.conversations = this.conversations.filter((conv) => conv.id !== id);
    this.serverChatIdMap.delete(id);
    this.saveConversations();

    if (this.currentConversationId === id) {
      this.switchToNewConversation();
    }
  }

  renameConversation(id, newName) {
    const conversation = this.getConversation(id);
    if (conversation && newName.trim()) {
      const trimmedName = newName.trim();

      if (trimmedName.length > 100) {
        throw new Error("اسم المحادثة لا يمكن أن يتجاوز 100 حرف");
      }

      conversation.name = trimmedName;
      this.updateConversation(id, { name: trimmedName });
      return true;
    }
    return false;
  }

  searchConversations(query) {
    if (!query.trim()) return this.conversations;

    const lowerQuery = query.toLowerCase();
    return this.conversations.filter(
      (conv) =>
        conv.name.toLowerCase().includes(lowerQuery) ||
        conv.messages.some((msg) => msg.text.toLowerCase().includes(lowerQuery))
    );
  }

  searchInConversation(conversationId, query) {
    const conversation = this.getConversation(conversationId);
    if (!conversation || !query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return conversation.messages.filter((msg) =>
      msg.text.toLowerCase().includes(lowerQuery)
    );
  }

  switchToNewConversation() {
    if (this.conversations.length > 0) {
      this.loadConversation(this.conversations[0].id);
    } else {
      this.currentConversationId = null;
      this.displayWelcomeMessage();
    }
  }

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

  loadConversation(
    conversationId,
    scrollToMessageId = null,
    searchQuery = null
  ) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.currentConversationId = conversationId;

      const welcome = document.querySelector(".welcome");
      if (welcome) welcome.style.display = "none";

      messages.innerHTML = "";

      conversation.messages.forEach((msg) => {
        const messageElement = addMessage(msg.text, msg.sender, false);

        messageElement.dataset.messageId = msg.messageId;

        addMessageActions(messageElement, msg.messageId);
      });

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

      document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active");
      });

      const activeItem = document.querySelector(
        `[data-conversation-id="${conversationId}"]`
      );
      if (activeItem) {
        activeItem.classList.add("active");
      }

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        sidebarOverlay.style.display = "none";
      }

      userInput.focus();
    }
  }

  displayWelcomeMessage() {
    this.currentConversationId = null;

    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.style.display = "flex";

    messages.innerHTML = "";

    document.querySelectorAll(".conversation-item").forEach((item) => {
      item.classList.remove("active");
    });
  }
}

const conversationManager = new ConversationManager();

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.querySelector(".messages");
const conversationList = document.getElementById("conversationList");

let waitingBot = false;

const API_CONFIG = {
  token: null,
  contentType: "application/json",
  apiUrl: "https://mohamed50mostafa.pythonanywhere.com/api/messages/",
  chatsUrl: "https://mohamed50mostafa.pythonanywhere.com/api/chats/",
};

function getAuthToken() {
  let token = localStorage.getItem("authToken");

  if (token && token !== "YOUR_AUTH_TOKEN_HERE") {
    return token;
  }

  token = prompt(
    `الرجاء إدخال رمز التوثيق (Token) الخاص بك:

يمكنك الحصول على التوكن من:
1. لوحة تحكم الموقع
2. إعدادات حسابك
3. التواصل مع مسؤول النظام

ملاحظة: هذا التوكن مطلوب للاتصال بخادم الذكاء الاصطناعي.`,
    ""
  );

  if (token && token.trim()) {
    token = token.trim();
    localStorage.setItem("authToken", token);
    showNotification("تم حفظ رمز التوثيق بنجاح!", "success");
    return token;
  } else {
    throw new Error(
      "لم يتم إدخال رمز التوثيق. يرجى تحديث الصفحة والمحاولة مرة أخرى عندما تكون جاهزاً."
    );
  }
}

async function createServerChat(chatName = null) {
  const token = getAuthToken();

  const response = await fetch(API_CONFIG.chatsUrl, {
    method: "POST",
    headers: {
      "Content-Type": API_CONFIG.contentType,
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      title: chatName || `محادثة جديدة ${new Date().toLocaleString()}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `فشل في إنشاء المحادثة على الخادم: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  return data.id;
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".custom-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `custom-notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"
    };
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 400px;
    word-wrap: break-word;
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
  }, 4000);
}

function copyMessageText(messageElement) {
  const text = messageElement.textContent || messageElement.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      messageElement.classList.add("message-copied");
      setTimeout(() => {
        messageElement.classList.remove("message-copied");
      }, 500);

      showNotification("تم نسخ الرسالة", "success");
    })
    .catch((err) => {
      console.error("فشل في نسخ النص: ", err);
      showNotification("فشل في نسخ الرسالة", "error");
    });
}

function editMessage(messageElement) {
  const currentText = messageElement.textContent || messageElement.innerText;
  const messageId = messageElement.dataset.messageId;

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

  messageElement.textContent = "";
  messageElement.appendChild(input);
  input.focus();

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
      conversationManager.updateMessage(
        conversationManager.currentConversationId,
        messageId,
        newText
      );

      conversationManager.truncateMessagesAfter(
        conversationManager.currentConversationId,
        messageId
      );

      conversationManager.loadConversation(
        conversationManager.currentConversationId
      );

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

async function sendEditedMessage(text) {
  if (waitingBot) return;

  waitingBot = true;
  sendBtn.disabled = true;

  try {
    const token = getAuthToken();
    const serverChatId = conversationManager.getServerChatId(
      conversationManager.currentConversationId
    );

    if (!serverChatId) {
      throw new Error("لا يوجد معرف محادثة صالح على الخادم");
    }

    const response = await fetch(API_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": API_CONFIG.contentType,
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        content: text,
        chat_id: serverChatId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("خطأ في المصادقة: الرجاء إدخال رمز توثيق صحيح");
      }
      const errorText = await response.text();
      console.error("Server Error Response:", errorText);
      throw new Error(`خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    const botReply =
      data.ai_message?.content ||
      data.message ||
      "تم استلام الرد من الخادم بنجاح";

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

    let errorMsg = "⚠️ حدث خطأ غير متوقع";
    if (err.message.includes("المصادقة")) {
      errorMsg = "🔐 " + err.message;
    } else if (
      err.name === "TypeError" &&
      err.message.includes("Failed to fetch")
    ) {
      errorMsg = "⚠️ تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.";
    } else if (err.message.includes("معرف محادثة")) {
      errorMsg = "⚠️ " + err.message + " يرجى إنشاء محادثة جديدة.";
    } else {
      errorMsg = "⚠️ " + err.message;
    }

    const errorMessageId = conversationManager.addMessage(
      conversationManager.currentConversationId,
      errorMsg,
      "bot"
    );
    const errorElement = addMessage(errorMsg, "bot");
    errorElement.dataset.messageId = errorMessageId;
    addMessageActions(errorElement, errorMessageId);
  } finally {
    waitingBot = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

function addMessageActions(messageElement, messageId = null) {
  const existingActions = messageElement.querySelector(".message-actions");
  if (existingActions) {
    existingActions.remove();
  }

  const messageActions = document.createElement("div");
  messageActions.className = "message-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "message-action-btn copy-btn";
  copyBtn.innerHTML = '<i class="far fa-copy"></i>';
  copyBtn.title = "نسخ الرسالة";
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    copyMessageText(messageElement);
  };

  messageActions.appendChild(copyBtn);

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

  setTimeout(() => {
    document.getElementById("cancelDeleteBtn").focus();
  }, 100);

  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#cancelDeleteBtn").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#confirmDeleteBtn").addEventListener("click", () => {
    conversationManager.deleteConversation(conversationId);
    loadConversationsList();
    overlay.remove();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  document.addEventListener("keydown", function closeOnEscape(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeOnEscape);
    }
  });
}

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

    listItem.addEventListener("click", (e) => {
      if (!e.target.closest(".conversation-actions")) {
        conversationManager.loadConversation(conversation.id);
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
          sidebarOverlay.style.display = "none";
        }
      }
    });

    const menuBtn = listItem.querySelector(".conversation-menu-btn");
    const menu = listItem.querySelector(".conversation-menu");

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      document.querySelectorAll(".conversation-menu").forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.classList.remove("active");
        }
      });

      menu.classList.toggle("active");
    });

    const renameBtn = listItem.querySelector(".rename-btn");
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("active");
      showRenameModal(conversation.id, conversation.name);
    });

    const deleteBtn = listItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("active");
      showDeleteConfirmation(conversation.name, conversation.id);
    });

    conversationList.appendChild(listItem);
  });

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

  const renameInput = document.getElementById("renameInput");
  const charCount = document.getElementById("renameCount");

  setTimeout(() => {
    renameInput.focus();
    renameInput.select();
  }, 100);

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

  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#cancelRenameBtn").addEventListener("click", () => {
    overlay.remove();
  });

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

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  renameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      popup.querySelector("#saveRenameBtn").click();
    }
  });
}

async function sendMessage() {
  if (waitingBot) return;
  const text = userInput.value.trim();
  if (!text) return;

  let currentConversationId = conversationManager.currentConversationId;
  let serverChatId = null;

  try {
    if (!currentConversationId) {
      const welcome = document.querySelector(".welcome");
      if (welcome) welcome.style.display = "none";

      showNotification("جاري إنشاء محادثة جديدة على الخادم...", "info");

      serverChatId = await createServerChat(
        `محادثة ${conversationManager.conversations.length + 1}`
      );

      currentConversationId = conversationManager.createConversation(
        `محادثة ${conversationManager.conversations.length + 1}`,
        serverChatId
      );
      conversationManager.currentConversationId = currentConversationId;
      loadConversationsList();
    } else {
      serverChatId = conversationManager.getServerChatId(currentConversationId);

      if (!serverChatId) {
        serverChatId = await createServerChat();
        conversationManager.updateServerChatId(
          currentConversationId,
          serverChatId
        );
      }
    }

    const messageId = conversationManager.addMessage(
      currentConversationId,
      text,
      "user"
    );
    const messageElement = addMessage(text, "user");
    messageElement.dataset.messageId = messageId;
    addMessageActions(messageElement, messageId);

    userInput.value = "";
    waitingBot = true;
    sendBtn.disabled = true;

    const token = getAuthToken();

    const response = await fetch(API_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": API_CONFIG.contentType,
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        content: text,
        chat_id: serverChatId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("خطأ في المصادقة: الرجاء إدخال رمز توثيق صحيح");
      }
      const errorText = await response.text();
      console.error("Server Error Response:", errorText);
      throw new Error(`خطأ في الخادم: ${response.status}`);
    }

    const data = await response.json();
    const botReply =
      data.ai_message?.content ||
      data.message ||
      "تم استلام الرد من الخادم بنجاح";

    const botMessageId = conversationManager.addMessage(
      currentConversationId,
      botReply,
      "bot"
    );
    const botMessageElement = addMessage(botReply, "bot");
    botMessageElement.dataset.messageId = botMessageId;
    addMessageActions(botMessageElement, botMessageId);
  } catch (err) {
    console.error("Error details:", err);

    let errorMsg = "⚠️ حدث خطأ غير متوقع";
    if (err.message.includes("لم يتم إدخال")) {
      errorMsg = "🔐 " + err.message;
    } else if (err.message.includes("المصادقة")) {
      errorMsg = "🔐 " + err.message;
    } else if (
      err.name === "TypeError" &&
      err.message.includes("Failed to fetch")
    ) {
      errorMsg = "⚠️ تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.";
    } else {
      errorMsg = "⚠️ " + err.message;
    }

    if (currentConversationId) {
      const errorMessageId = conversationManager.addMessage(
        currentConversationId,
        errorMsg,
        "bot"
      );
      const errorElement = addMessage(errorMsg, "bot");
      errorElement.dataset.messageId = errorMessageId;
      addMessageActions(errorElement, errorMessageId);
    } else {
      showNotification(errorMsg, "error");
    }
  } finally {
    waitingBot = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

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

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

const newChatBtn = document.querySelector(".new-chat-btn");

newChatBtn.addEventListener("click", async () => {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.style.display = "flex";

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

  const chatNameInput = document.getElementById("chatNameInput");
  const charCount = document.getElementById("chatNameCount");

  setTimeout(() => {
    chatNameInput.focus();
  }, 100);

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

  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#cancelChatBtn").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#saveChatBtn").addEventListener("click", async () => {
    const chatName = chatNameInput.value.trim();
    const name =
      chatName || `محادثة ${conversationManager.conversations.length + 1}`;

    try {
      showNotification("جاري إنشاء المحادثة على الخادم...", "info");

      const serverChatId = await createServerChat(name);

      const newId = conversationManager.createConversation(name, serverChatId);

      loadConversationsList();
      conversationManager.loadConversation(newId);
      overlay.remove();

      setTimeout(() => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
          sidebarOverlay.style.display = "none";
        }
      }, 500);

      showNotification("تم إنشاء المحادثة بنجاح!", "success");
    } catch (error) {
      console.error("Error creating chat:", error);
      showNotification(`فشل في إنشاء المحادثة: ${error.message}`, "error");
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  chatNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      popup.querySelector("#saveChatBtn").click();
    }
  });
});

const searchBtn = document.querySelector('.icon[data-text="بحث عن المحادثات"]');

searchBtn.addEventListener("click", () => {
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
      </div>
    <div class="actions">
      <button id="closeSearchBtn">إغلاق</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.getElementById("searchInput").focus();
  }, 100);

  popup.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });

  popup.querySelector("#closeSearchBtn").addEventListener("click", () => {
    overlay.remove();
  });

  const searchInput = popup.querySelector("#searchInput");
  const searchResults = popup.querySelector("#searchResults");

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    performSearch(query, searchResults);
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  document.addEventListener("keydown", function closeOnEscape(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeOnEscape);
    }
  });
});

function performSearch(query, resultsContainer) {
  resultsContainer.innerHTML = "";

  if (!query) {
    resultsContainer.innerHTML =
      '<p class="no-results">اكتب كلمة للبحث في المحادثات</p>';
    return;
  }

  const results = conversationManager.searchConversations(query);

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">لا توجد نتائج</p>';
    return;
  }

  results.forEach((conv) => {
    const convResult = document.createElement("div");
    convResult.className = "search-conversation-result";
    convResult.innerHTML = `<strong>${conv.name}</strong>`;
    resultsContainer.appendChild(convResult);

    const messages = conversationManager.searchInConversation(conv.id, query);
    messages.forEach((msg) => {
      const msgResult = document.createElement("p");
      msgResult.className = "search-message-result";
      msgResult.textContent = `...${msg.text.substring(0, 50)}...`;
      msgResult.onclick = () => {
        conversationManager.loadConversation(conv.id, msg.messageId, query);
        document.querySelector(".overlay").remove();
      };
      convResult.appendChild(msgResult);
    });
  });
}

function highlightTextInMessage(messageElement, query) {
  const text = messageElement.textContent;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const parts = [];
  let lastIndex = 0;
  let matchIndex;

  while ((matchIndex = lowerText.indexOf(lowerQuery, lastIndex)) !== -1) {
    if (matchIndex > lastIndex) {
      parts.push(
        document.createTextNode(text.substring(lastIndex, matchIndex))
      );
    }

    const matchSpan = document.createElement("span");
    matchSpan.className = "highlight";
    matchSpan.textContent = text.substring(
      matchIndex,
      matchIndex + query.length
    );
    parts.push(matchSpan);

    lastIndex = matchIndex + query.length;
  }

  if (lastIndex < text.length) {
    parts.push(document.createTextNode(text.substring(lastIndex)));
  }

  messageElement.innerHTML = "";
  parts.forEach((part) => messageElement.appendChild(part));
}

function removeHighlightFromMessage(messageElement) {
  messageElement.textContent = messageElement.textContent;
}

const style = document.createElement("style");
style.textContent = `
  .highlight {
    background-color: #ffeb3b;
    color: #000;
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  .search-result-message {
    border: 2px solid #ffeb3b !important;
    animation: pulse 1s ease-in-out;
  }
  
  @keyframes pulse {
    0% { border-color: #ffeb3b; }
    50% { border-color: #ff9800; }
    100% { border-color: #ffeb3b; }
  }
  
  .message-copied {
    background-color: rgba(43, 168, 217, 0.3) !important;
    transition: background-color 0.5s ease;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .custom-notification {
    font-family: inherit;
  }
`;
document.head.appendChild(style);
