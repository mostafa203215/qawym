function choose(option) {
  const storyText = document.getElementById("story-text");
  const choices = document.getElementById("choices");

  if (option === "cross") {
    storyText.textContent =
      "الأرنب حاول عبور النهر، لكن الماء كان عميقًا وكاد أن يغرق. أنقذه عصفور طيب، وقال له: لا تخاطر بحياتك من أجل طعام.";
    choices.innerHTML = `
      <button onclick="choose('listen')">يسمع كلام العصفور</button>
      <button onclick="choose('ignore')">يتجاهل وينزل النهر مرة أخرى</button>
    `;
  } else if (option === "search") {
    storyText.textContent =
      "الأرنب بدأ يبحث في الغابة، فوجد جزرة صغيرة لكنها غير نظيفة. ماذا يفعل؟";
    choices.innerHTML = `
      <button onclick="choose('eatDirty')">يأكلها كما هي</button>
      <button onclick="choose('washCarrot')">يغسلها أولًا</button>
    `;
  } else if (option === "listen") {
    storyText.textContent =
      "الأرنب استمع إلى كلام العصفور، وقرر أن يبحث في الغابة بدلًا من المخاطرة.";
    choices.innerHTML = `
      <button onclick="choose('search')">يبحث عن طعام في الغابة</button>
    `;
  } else if (option === "ignore") {
    storyText.textContent =
      "الأرنب تجاهل النصيحة وقفز مرة أخرى... فغرق بالفعل! النهاية الحزينة.";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  } else if (option === "eatDirty") {
    storyText.textContent =
      "الأرنب أكل الجزرة دون غسلها، فمرض وتعلم درسًا: النظافة مهمة جدًا!";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  } else if (option === "washCarrot") {
    storyText.textContent =
      "الأرنب غسل الجزرة جيدًا، وأكلها بصحة وسعادة. وبعد قليل وجد حقل جزر كبير مليء بالجزر الطازج! 🍀🥕";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  }
}

function restart() {
  document.getElementById("story-text").textContent =
    "في يوم من الأيام كان هناك أرنب صغير يعيش في الغابة، وكان يحب الجزر كثيرًا.  في الصباح خرج يبحث عن طعام، فرأى جزرًا جميلًا خلف النهر...  ماذا يفعل الأرنب؟";
  document.getElementById("choices").innerHTML = `
    <button onclick="choose('cross')">يحاول عبور النهر</button>
    <button onclick="choose('search')">يبحث عن طعام في الغابة</button>
  `;
}
