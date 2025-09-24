// ======== سايدبار ديناميكي ========
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle-btn");

// فتح/اغلاق السايدبار
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// إضافة محادثات افتراضية
const conversationList = document.getElementById("conversationList");
const conversations = ["محادثة 1", "محادثة 2", "محادثة 3"];
conversations.forEach((conv) => {
  const li = document.createElement("li");
  li.textContent = conv;
  conversationList.appendChild(li);
});

// ======== عناصر المحادثة ========
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.querySelector(".messages");

let waitingBot = false;

// دالة إرسال الرسائل
function sendMessage() {
  if (waitingBot) return;
  const text = userInput.value.trim();
  if (text) {
    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.remove();

    addMessage(text, "user");
    userInput.value = "";

    waitingBot = true;
    sendBtn.disabled = true;

    fetch(
      `https://mohamed50mostafa.pythonanywhere.com/api/?message=${encodeURIComponent(
        text
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("خطأ في الاتصال بالـ API");
        return res.json();
      })
      .then((data) => {
        const botReply = data.reply || JSON.stringify(data, null, 2);
        addMessage(botReply, "bot");
      })
      .catch((err) => {
        addMessage("⚠️ حصل خطأ: " + err.message, "bot");
      })
      .finally(() => {
        waitingBot = false;
        sendBtn.disabled = false;
        userInput.focus();
      });
  }
}

// دالة إضافة الرسائل
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
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

  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, 800);
  });
});
